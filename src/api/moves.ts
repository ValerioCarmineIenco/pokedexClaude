import { fetchJson } from '@/api/client';
import { LAST_POKEMON_ID } from '@/api/generations';
import { getArtworkUrl, getIdFromUrl } from '@/api/pokemon';
import moveIndex from '@/data/moveIndex.json';
import { labelMap, perLanguage, t } from '@/i18n';
import { localName } from '@/i18n/names';
import type {
  MatchupType,
  Move,
  MoveDamageClass,
  MoveIndexEntry,
  MovePokemon,
  MoveStatChange,
  MoveSummary,
  TypeMatchups,
} from '@/types/move';
import type { MoveResponse, NamedAPIResource, TypeResponse } from '@/types/pokeapi';
import { TYPE_NAMES, type TypeName } from '@/types/pokemon';
import { TYPE_LABELS } from '@/theme/typeNames';
import { formatName } from '@/utils/format';
import { cleanText, latestLocalizedFlavor, localized } from '@/utils/pokeapiText';
import { normalizeSearch } from '@/utils/search';

/**
 * Mosse mostrate nell'app, in ordine di id: solo quelle che impara almeno un Pokémon del
 * Pokédex, così quando si aggiunge una generazione le sue mosse compaiono da sole.
 * Generato da `scripts/generate-move-index.mjs`.
 */
const INDEX = (moveIndex as MoveIndexEntry[]).filter((entry) => entry.firstPokemonId <= LAST_POKEMON_ID);
const BY_ID = new Map(INDEX.map((entry) => [entry.id, entry]));

/** Nome della mossa nella lingua in uso, da PokéAPI; l'etichetta dell'indice se manca. */
const moveName = (entry: MoveIndexEntry) => localName('move', entry.id, entry.label);

/**
 * Testo su cui cerca `search`: nome nella lingua in uso e slug inglese («fulmine thunderbolt»).
 * Ricalcolato al cambio di lingua.
 */
const searchText = perLanguage(
  () => new Map(INDEX.map((entry) => [entry.id, normalizeSearch(`${moveName(entry)} ${entry.name.replace(/-/g, ' ')}`)])),
);

export const MOVE_DAMAGE_CLASSES: readonly MoveDamageClass[] = ['physical', 'special', 'status'];

/** Nome della classe di danno nella lingua in uso (Fisico, Speciale, Stato). */
export const DAMAGE_CLASS_LABELS: Record<MoveDamageClass, string> = labelMap(MOVE_DAMAGE_CLASSES, (damageClass) =>
  t(`moves:damageClass.${damageClass}`),
);

/** Bersagli di PokéAPI con un nome tradotto (PokéAPI non ha l'italiano): scritti come nei giochi. */
const TARGETS = [
  'specific-move',
  'selected-pokemon-me-first',
  'ally',
  'users-field',
  'user-or-ally',
  'opponents-field',
  'user',
  'random-opponent',
  'all-other-pokemon',
  'selected-pokemon',
  'all-opponents',
  'entire-field',
  'user-and-allies',
  'all-pokemon',
  'all-allies',
  'fainting-pokemon',
] as const;
type MoveTarget = (typeof TARGETS)[number];

/** Stati alterati e simili (`/move-ailment`): PokéAPI non ha l'italiano. */
const AILMENTS = [
  'paralysis',
  'sleep',
  'freeze',
  'burn',
  'poison',
  'confusion',
  'infatuation',
  'trap',
  'nightmare',
  'torment',
  'disable',
  'yawn',
  'heal-block',
  'no-type-immunity',
  'leech-seed',
  'embargo',
  'perish-song',
  'ingrain',
  'silence',
  'tar-shot',
] as const;
type MoveAilment = (typeof AILMENTS)[number];

const STAT_CHANGES: readonly MoveStatChange['stat'][] = [
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
  'accuracy',
  'evasion',
];

const isOneOf = <T extends string>(list: readonly T[], value: string): value is T =>
  (list as readonly string[]).includes(value);

function toSummary(entry: MoveIndexEntry): MoveSummary {
  return {
    id: entry.id,
    name: moveName(entry),
    type: entry.type,
    damageClass: entry.damageClass,
    damageClassLabel: DAMAGE_CLASS_LABELS[entry.damageClass],
    power: entry.power,
    accuracy: entry.accuracy,
    pp: entry.pp,
    generation: entry.generation,
  };
}

/** Voci dell'elenco con nomi ed etichette nella lingua in uso. */
const summaries = perLanguage(() => {
  const list = INDEX.map(toSummary);
  return { list, byId: new Map(list.map((move) => [move.id, move])) };
});

/**
 * Mosse il cui nome contiene `search` (anche parziale, senza distinzione di maiuscole e
 * accenti), in ordine di id. Tutto dall'indice locale: nessuna chiamata di rete.
 */
export function getMoves(search = ''): MoveSummary[] {
  const needle = normalizeSearch(search);
  const { list } = summaries();
  if (!needle) return list;
  const text = searchText();
  return list.filter((move) => text.get(move.id)!.includes(needle));
}

/** Voce dell'elenco di una mossa, undefined se non è tra quelle dell'app. */
export function getMoveSummary(id: number): MoveSummary | undefined {
  return summaries().byId.get(id);
}

/** Converte il parametro di rotta (`"85"`) in un id dell'indice, altrimenti null. */
export function parseMoveId(value: string | string[] | number | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  return Number.isInteger(id) && BY_ID.has(id) ? id : null;
}

const isTypeName = (name: string): name is TypeName => (TYPE_NAMES as readonly string[]).includes(name);

const GENERATION_NUMBERS: Record<string, number> = {
  'generation-i': 1,
  'generation-ii': 2,
  'generation-iii': 3,
  'generation-iv': 4,
  'generation-v': 5,
  'generation-vi': 6,
  'generation-vii': 7,
  'generation-viii': 8,
  'generation-ix': 9,
};

/** `$effect_chance` nei testi di PokéAPI → la probabilità vera. */
function fillEffect(text: string, chance: number | null): string {
  return cleanText(text.replace(/\$effect_chance/g, String(chance ?? 0)));
}

/**
 * Spada e Scudo sostituiscono la descrizione delle mosse tolte dal gioco con un avviso
 * («Questa mossa non può essere usata…», in ogni lingua): si salta e resta quella dei giochi
 * precedenti. Testi presi da PokéAPI (`sword-shield`); `ja-Hrkt` è in kana.
 */
const UNUSABLE_FLAVOR = new RegExp(
  '^(' +
    [
      'This move can.t be used',
      'Questa mossa non può essere usata',
      'Cette capacité ne peut pas être utilisée',
      'Diese Attacke kann nicht eingesetzt werden',
      'Este movimiento no se puede usar',
      'この技は\\s*使えません',
      'このわざは\\s*つかえません',
    ].join('|') +
    ')',
);

const range = (min: number | null, max: number | null) =>
  min == null && max == null ? null : { min: min ?? max!, max: max ?? min! };

export function toMove(raw: MoveResponse): Move {
  const entry = BY_ID.get(raw.id);
  const name = localized(raw.names)?.name ?? localName('move', raw.id, entry?.label ?? formatName(raw.name));
  const type = isTypeName(raw.type.name) ? raw.type.name : (entry?.type ?? 'normal');
  const damageClass = (
    isOneOf(MOVE_DAMAGE_CLASSES, raw.damage_class.name) ? raw.damage_class.name : (entry?.damageClass ?? 'status')
  ) as MoveDamageClass;

  const flavors = raw.flavor_text_entries
    .filter((flavor) => !UNUSABLE_FLAVOR.test(flavor.flavor_text))
    .map((flavor) => ({ text: flavor.flavor_text, language: flavor.language }));
  // Effetto per esteso: PokéAPI lo ha in inglese e a volte in francese o tedesco.
  const effectEntry = localized(raw.effect_entries);
  const effect = effectEntry ? fillEffect(effectEntry.effect, raw.effect_chance) || null : null;
  const shortEffect = effectEntry ? fillEffect(effectEntry.short_effect, raw.effect_chance) || null : null;
  const effectLanguage = effectEntry?.language.name ?? null;
  const description = latestLocalizedFlavor(flavors) ?? shortEffect ?? '';

  const meta = raw.meta;
  const ailmentName = meta?.ailment.name;
  const ailment =
    !ailmentName || ailmentName === 'none' || ailmentName === 'unknown'
      ? null
      : isOneOf<MoveAilment>(AILMENTS, ailmentName)
        ? t(`moves:ailment.${ailmentName}`)
        : formatName(ailmentName);

  const statChanges: MoveStatChange[] = raw.stat_changes
    .filter((change) => isOneOf(STAT_CHANGES, change.stat.name))
    .map((change) => {
      const stat = change.stat.name as MoveStatChange['stat'];
      return { stat, label: t(`moves:statChange.${stat}`), change: change.change };
    });

  // Solo i Pokémon del Pokédex: forme alternative (id da 10001) e generazioni non coperte
  // restano fuori. Uno stesso Pokémon compare una volta sola.
  const pokemon = new Map<number, MovePokemon>();
  for (const resource of raw.learned_by_pokemon) {
    const id = getIdFromUrl(resource.url);
    if (id > LAST_POKEMON_ID || pokemon.has(id)) continue;
    pokemon.set(id, { id, name: resource.name, artworkUrl: getArtworkUrl(id) });
  }

  return {
    id: raw.id,
    name,
    type,
    damageClass,
    damageClassLabel: DAMAGE_CLASS_LABELS[damageClass],
    power: raw.power,
    accuracy: raw.accuracy,
    pp: raw.pp ?? entry?.pp ?? 0,
    generation: GENERATION_NUMBERS[raw.generation.name] ?? entry?.generation ?? 0,
    description,
    effect,
    shortEffect,
    effectLanguage,
    effectChance: raw.effect_chance,
    priority: raw.priority,
    target: raw.target.name,
    targetLabel: isOneOf<MoveTarget>(TARGETS, raw.target.name)
      ? t(`moves:target.${raw.target.name}`)
      : formatName(raw.target.name),
    ailment,
    ailmentChance: meta?.ailment_chance ?? 0,
    flinchChance: meta?.flinch_chance ?? 0,
    critRate: meta?.crit_rate ?? 0,
    hits: range(meta?.min_hits ?? null, meta?.max_hits ?? null),
    turns: range(meta?.min_turns ?? null, meta?.max_turns ?? null),
    drain: meta?.drain ?? 0,
    healing: meta?.healing ?? 0,
    statChanges,
    statChance: meta?.stat_chance ?? 0,
    pokemon: [...pokemon.values()].sort((a, b) => a.id - b.id),
  };
}

/** Dettaglio di una mossa. */
export async function getMove(id: number, signal?: AbortSignal): Promise<Move> {
  const raw = await fetchJson<MoveResponse>(`/move/${id}`, signal, t('moves:detail.notFoundError'));
  return toMove(raw);
}

/** Tipi di PokéAPI → tipi dell'app, senza quelli speciali (Astrale, Ombra…) e in ordine. */
function toMatchupTypes(resources: NamedAPIResource[]): MatchupType[] {
  const names = new Set(resources.map((resource) => resource.name));
  return TYPE_NAMES.filter((type) => names.has(type)).map((type) => ({ type, label: TYPE_LABELS[type] }));
}

export function toTypeMatchups(raw: TypeResponse): TypeMatchups {
  const relations = raw.damage_relations;
  const superEffective = toMatchupTypes(relations.double_damage_to);
  const notVeryEffective = toMatchupTypes(relations.half_damage_to);
  const noEffect = toMatchupTypes(relations.no_damage_to);
  const listed = new Set([...superEffective, ...notVeryEffective, ...noEffect].map((entry) => entry.type));
  return {
    type: raw.name as TypeName,
    attack: {
      superEffective,
      notVeryEffective,
      noEffect,
      normal: TYPE_NAMES.filter((type) => !listed.has(type)).map((type) => ({ type, label: TYPE_LABELS[type] })),
    },
    defense: {
      weakTo: toMatchupTypes(relations.double_damage_from),
      resists: toMatchupTypes(relations.half_damage_from),
      immuneTo: toMatchupTypes(relations.no_damage_from),
    },
  };
}

/** Efficacia di un tipo in attacco e in difesa. */
export async function getTypeMatchups(type: TypeName, signal?: AbortSignal): Promise<TypeMatchups> {
  const raw = await fetchJson<TypeResponse>(`/type/${type}`, signal, t('types:errors.notFound'));
  return toTypeMatchups(raw);
}
