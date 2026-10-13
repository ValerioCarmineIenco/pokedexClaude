import { fetchJson } from '@/api/client';
import { LAST_POKEMON_ID } from '@/api/generations';
import { getArtworkUrl, getIdFromUrl } from '@/api/pokemon';
import moveIndex from '@/data/moveIndex.json';
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
import { TYPE_NAMES_IT } from '@/theme/typeNames';
import { formatName } from '@/utils/format';
import { byLanguage, cleanText, latestFlavor } from '@/utils/pokeapiText';
import { normalizeSearch } from '@/utils/search';

/**
 * Mosse mostrate nell'app, in ordine di id: solo quelle che impara almeno un Pokémon del
 * Pokédex, così quando si aggiunge una generazione le sue mosse compaiono da sole.
 * Generato da `scripts/generate-move-index.mjs`.
 */
const INDEX = (moveIndex as MoveIndexEntry[]).filter((entry) => entry.firstPokemonId <= LAST_POKEMON_ID);
const BY_ID = new Map(INDEX.map((entry) => [entry.id, entry]));

/** Testo su cui cerca `search`: nome italiano e slug inglese («fulmine thunderbolt»). */
const SEARCH_TEXT = new Map(
  INDEX.map((entry) => [entry.id, normalizeSearch(`${entry.label} ${entry.name.replace(/-/g, ' ')}`)]),
);

export const DAMAGE_CLASS_LABELS: Record<MoveDamageClass, string> = {
  physical: 'Fisico',
  special: 'Speciale',
  status: 'Stato',
};

/** PokéAPI non ha i nomi italiani dei bersagli: sono scritti come nei giochi. */
const TARGET_LABELS: Record<string, string> = {
  'specific-move': 'Una mossa specifica',
  'selected-pokemon-me-first': 'Un avversario a scelta',
  ally: 'Un alleato',
  'users-field': 'Il proprio lato del campo',
  'user-or-ally': 'Chi la usa o un alleato',
  'opponents-field': 'Il lato avversario del campo',
  user: 'Chi la usa',
  'random-opponent': 'Un avversario a caso',
  'all-other-pokemon': 'Tutti gli altri Pokémon',
  'selected-pokemon': 'Un Pokémon a scelta',
  'all-opponents': 'Tutti gli avversari',
  'entire-field': "L'intero campo",
  'user-and-allies': 'Chi la usa e gli alleati',
  'all-pokemon': 'Tutti i Pokémon',
  'all-allies': 'Tutti gli alleati',
  'fainting-pokemon': 'Un Pokémon esausto',
};

/** Stati alterati e simili (`/move-ailment`): PokéAPI non ha l'italiano. */
const AILMENT_LABELS: Record<string, string> = {
  paralysis: 'Paralisi',
  sleep: 'Sonno',
  freeze: 'Congelamento',
  burn: 'Scottatura',
  poison: 'Avvelenamento',
  confusion: 'Confusione',
  infatuation: 'Infatuazione',
  trap: 'Intrappolamento',
  nightmare: 'Incubo',
  torment: 'Attaccalite',
  disable: 'Inibitore',
  yawn: 'Sbadiglio',
  'heal-block': 'Anticura',
  'no-type-immunity': 'Annulla immunità',
  'leech-seed': 'Parassiseme',
  embargo: 'Divieto',
  'perish-song': 'Ultimocanto',
  ingrain: 'Radicamento',
  silence: 'Silenzio',
  'tar-shot': 'Catramata',
};

const STAT_CHANGE_LABELS: Record<MoveStatChange['stat'], string> = {
  attack: 'Attacco',
  defense: 'Difesa',
  'special-attack': 'Attacco Speciale',
  'special-defense': 'Difesa Speciale',
  speed: 'Velocità',
  accuracy: 'Precisione',
  evasion: 'Elusione',
};

function toSummary(entry: MoveIndexEntry): MoveSummary {
  return {
    id: entry.id,
    name: entry.label,
    type: entry.type,
    damageClass: entry.damageClass,
    damageClassLabel: DAMAGE_CLASS_LABELS[entry.damageClass],
    power: entry.power,
    accuracy: entry.accuracy,
    pp: entry.pp,
    generation: entry.generation,
  };
}

const SUMMARIES = INDEX.map(toSummary);
const SUMMARY_BY_ID = new Map(SUMMARIES.map((move) => [move.id, move]));

/**
 * Mosse il cui nome contiene `search` (anche parziale, senza distinzione di maiuscole e
 * accenti), in ordine di id. Tutto dall'indice locale: nessuna chiamata di rete.
 */
export function getMoves(search = ''): MoveSummary[] {
  const needle = normalizeSearch(search);
  if (!needle) return SUMMARIES;
  return SUMMARIES.filter((move) => SEARCH_TEXT.get(move.id)!.includes(needle));
}

/** Voce dell'elenco di una mossa, undefined se non è tra quelle dell'app. */
export function getMoveSummary(id: number): MoveSummary | undefined {
  return SUMMARY_BY_ID.get(id);
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
 * («Questa mossa non può essere usata…»): si salta e resta quella dei giochi precedenti.
 */
const UNUSABLE_FLAVOR = /^(Questa mossa non può essere usata|This move can.t be used)/;

const range = (min: number | null, max: number | null) =>
  min == null && max == null ? null : { min: min ?? max!, max: max ?? min! };

export function toMove(raw: MoveResponse): Move {
  const entry = BY_ID.get(raw.id);
  const name =
    raw.names.find(byLanguage('it'))?.name ?? raw.names.find(byLanguage('en'))?.name ?? formatName(raw.name);
  const type = isTypeName(raw.type.name) ? raw.type.name : (entry?.type ?? 'normal');
  const damageClass = (
    raw.damage_class.name in DAMAGE_CLASS_LABELS ? raw.damage_class.name : (entry?.damageClass ?? 'status')
  ) as MoveDamageClass;

  const flavors = raw.flavor_text_entries
    .filter((flavor) => !UNUSABLE_FLAVOR.test(flavor.flavor_text))
    .map((flavor) => ({ text: flavor.flavor_text, language: flavor.language }));
  const english = raw.effect_entries.find(byLanguage('en'));
  const effect = english ? fillEffect(english.effect, raw.effect_chance) || null : null;
  const shortEffect = english ? fillEffect(english.short_effect, raw.effect_chance) || null : null;
  const description = latestFlavor(flavors, 'it') ?? latestFlavor(flavors, 'en') ?? shortEffect ?? '';

  const meta = raw.meta;
  const ailmentName = meta?.ailment.name;
  const ailment =
    !ailmentName || ailmentName === 'none' || ailmentName === 'unknown'
      ? null
      : (AILMENT_LABELS[ailmentName] ?? formatName(ailmentName));

  const statChanges: MoveStatChange[] = raw.stat_changes
    .filter((change) => change.stat.name in STAT_CHANGE_LABELS)
    .map((change) => {
      const stat = change.stat.name as MoveStatChange['stat'];
      return { stat, label: STAT_CHANGE_LABELS[stat], change: change.change };
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
    effectChance: raw.effect_chance,
    priority: raw.priority,
    target: raw.target.name,
    targetLabel: TARGET_LABELS[raw.target.name] ?? formatName(raw.target.name),
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
  const raw = await fetchJson<MoveResponse>(`/move/${id}`, signal, 'Mossa non trovata.');
  return toMove(raw);
}

/** Tipi di PokéAPI → tipi dell'app, senza quelli speciali (Astrale, Ombra…) e in ordine. */
function toMatchupTypes(resources: NamedAPIResource[]): MatchupType[] {
  const names = new Set(resources.map((resource) => resource.name));
  return TYPE_NAMES.filter((type) => names.has(type)).map((type) => ({ type, label: TYPE_NAMES_IT[type] }));
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
      normal: TYPE_NAMES.filter((type) => !listed.has(type)).map((type) => ({ type, label: TYPE_NAMES_IT[type] })),
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
  const raw = await fetchJson<TypeResponse>(`/type/${type}`, signal, 'Tipo non trovato.');
  return toTypeMatchups(raw);
}
