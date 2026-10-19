import type { ParseKeys } from 'i18next';

import { fetchJson } from '@/api/client';
import { getIdFromUrl } from '@/api/pokemon';
import itemIndex from '@/data/itemIndex.json';
import locationIndex from '@/data/locationIndex.json';
import moveIndex from '@/data/moveIndex.json';
import { getLocale, t } from '@/i18n';
import { localName, pokemonName } from '@/i18n/names';
import { TYPE_LABELS } from '@/theme/typeNames';
import type {
  EvolutionChain,
  EvolutionMethod,
  EvolutionStage,
  EvolutionTextPart,
} from '@/types/evolution';
import type { ItemIndexEntry } from '@/types/item';
import type { LocationIndexEntry } from '@/types/location';
import type { MoveIndexEntry } from '@/types/move';
import type {
  ChainLinkResponse,
  EvolutionChainResponse,
  EvolutionDetailResponse,
  NamedAPIResource,
} from '@/types/pokeapi';
import { TYPE_NAMES, type TypeName } from '@/types/pokemon';
import { formatName } from '@/utils/format';

// Voci degli indici locali, per slug: nessuna chiamata per oggetto, mossa o luogo.
// Il nome si legge nella lingua in uso quando si compone la frase.
const ITEMS = new Map((itemIndex as ItemIndexEntry[]).map((entry) => [entry.name, entry]));
const MOVES = new Map((moveIndex as MoveIndexEntry[]).map((entry) => [entry.name, entry]));
const LOCATIONS = new Map(
  (locationIndex as LocationIndexEntry[]).map((entry) => [entry.name, entry]),
);

/** Al massimo tanti metodi per passaggio, per non affollare la scheda (Alcremie ne ha 63). */
const MAX_METHODS = 4;
const MAX_LEGACY_METHODS = 3;

/** Id nazionali dei Pokémon citati nelle frasi dei metodi speciali. */
const NINCADA = 290;
const BISHARP = 625;
const MELTAN = 808;
const GIMMIGHOUL = 999;

const TIME_OF_DAY = {
  day: 'condition.day',
  night: 'condition.night',
  dusk: 'condition.dusk',
  'full-moon': 'condition.fullMoon',
} as const satisfies Record<string, EvolutionKey>;

/** Le rocce di Leafeon e Glaceon (`near_special_rock`). */
const SPECIAL_ROCKS = {
  leafeon: 'condition.mossRock',
  glaceon: 'condition.iceRock',
} as const satisfies Record<string, EvolutionKey>;

type EvolutionKey = ParseKeys<'evolution'>;

const text = (value: string): EvolutionTextPart => ({ kind: 'text', text: value });

// Segnaposto dei collegamenti dentro una frase tradotta (caratteri di uso privato).
const SLOT_OPEN = '\uE000';
const SLOT_CLOSE = '\uE001';
const SLOT = /\uE000(\d+)\uE001/;

/**
 * Frase intera tradotta, divisa in pezzi: i valori che sono pezzi (oggetti e luoghi da
 * toccare, o altre frasi già composte) entrano come segnaposto e tornano al loro posto.
 */
function phrase(
  key: EvolutionKey,
  values: Record<string, string | number | EvolutionTextPart | EvolutionTextPart[]> = {},
): EvolutionTextPart[] {
  const slots: EvolutionTextPart[][] = [];
  const options: Record<string, string | number> = {};
  for (const [name, value] of Object.entries(values)) {
    if (typeof value === 'string' || typeof value === 'number') {
      options[name] = value;
    } else {
      options[name] = `${SLOT_OPEN}${slots.length}${SLOT_CLOSE}`;
      slots.push(Array.isArray(value) ? value : [value]);
    }
  }
  const result: string = t(key, { ns: 'evolution', ...options });
  return result
    .split(SLOT)
    .flatMap((piece, i) => (i % 2 === 1 ? slots[Number(piece)] : piece ? [text(piece)] : []));
}

function item(resource: NamedAPIResource): EvolutionTextPart {
  const entry = ITEMS.get(resource.name);
  return entry
    ? { kind: 'item', text: localName('item', entry.id, entry.label), itemId: entry.id }
    : text(localName('item', getIdFromUrl(resource.url), formatName(resource.name)));
}

function location(resource: NamedAPIResource): EvolutionTextPart {
  const entry = LOCATIONS.get(resource.name);
  return entry
    ? { kind: 'location', text: localName('location', entry.id, entry.label), locationId: entry.id }
    : text(localName('location', getIdFromUrl(resource.url), formatName(resource.name)));
}

function move(resource: NamedAPIResource): string {
  const entry = MOVES.get(resource.name);
  return entry ? localName('move', entry.id, entry.label) : formatName(resource.name);
}

const species = (resource: NamedAPIResource) => pokemonName(getIdFromUrl(resource.url), resource.name);

function typeName(resource: NamedAPIResource): string {
  return (TYPE_NAMES as readonly string[]).includes(resource.name)
    ? TYPE_LABELS[resource.name as TypeName]
    : formatName(resource.name);
}

/** Inizio della frase, dal tipo di evoluzione (`trigger`). */
function describeTrigger(detail: EvolutionDetailResponse): EvolutionTextPart[] {
  const level = detail.min_level;
  const count = detail.min_move_count;
  const damage = detail.min_damage_taken;
  switch (detail.trigger.name) {
    case 'level-up':
      return level ? phrase('trigger.level', { level }) : phrase('trigger.levelUp');
    case 'in-battle-level-up':
      return level ? phrase('trigger.battleLevel', { level }) : phrase('trigger.battleLevelUp');
    case 'use-item':
      return detail.item ? phrase('trigger.useItem', { item: item(detail.item) }) : phrase('trigger.useAnyItem');
    case 'trade':
      return phrase('trigger.trade');
    case 'shed':
      return phrase('trigger.shed', { nincada: pokemonName(NINCADA) });
    case 'spin':
      return phrase('trigger.spin');
    case 'tower-of-darkness':
      return phrase('trigger.towerOfDarkness');
    case 'tower-of-waters':
      return phrase('trigger.towerOfWaters');
    case 'three-critical-hits':
      return phrase('trigger.threeCriticalHits');
    case 'take-damage':
      return damage ? phrase('trigger.takeDamageMin', { damage }) : phrase('trigger.takeDamage');
    case 'recoil-damage':
      return damage ? phrase('trigger.recoilDamageMin', { damage }) : phrase('trigger.recoilDamage');
    case 'agile-style-move':
    case 'strong-style-move': {
      const style = t(detail.trigger.name === 'agile-style-move' ? 'evolution:styles.agile' : 'evolution:styles.strong');
      if (!detail.used_move) return phrase('trigger.styleAnyMove', { style });
      const usedMove = move(detail.used_move);
      return count
        ? phrase('trigger.styleMoveTimes', { move: usedMove, style, count })
        : phrase('trigger.styleMove', { move: usedMove, style });
    }
    case 'use-move':
      if (!detail.used_move) return phrase('trigger.useAnyMove');
      return count
        ? phrase('trigger.useMoveTimes', { move: move(detail.used_move), count })
        : phrase('trigger.useMove', { move: move(detail.used_move) });
    case 'three-defeated-bisharp':
      return phrase('trigger.defeatBisharp', { bisharp: pokemonName(BISHARP) });
    case 'meltan-candies':
      return phrase('trigger.meltanCandies', { meltan: pokemonName(MELTAN) });
    case 'gimmighoul-coins':
      return phrase('trigger.gimmighoulCoins', { gimmighoul: pokemonName(GIMMIGHOUL) });
    default:
      return [text(formatName(detail.trigger.name))];
  }
}

/**
 * Condizioni da aggiungere dopo l'inizio della frase (es. «di notte», «tenendo Rasoiartiglio»).
 * Con `generalLocation` il luogo preciso diventa generico: nei giochi vecchi cambia da gioco a gioco.
 */
function describeConditions(
  detail: EvolutionDetailResponse,
  speciesName: string,
  generalLocation: boolean,
): EvolutionTextPart[][] {
  const conditions: EvolutionTextPart[][] = [];
  const add = (parts: EvolutionTextPart[]) => conditions.push(parts);

  if (detail.trade_species) add(phrase('condition.tradeWith', { pokemon: species(detail.trade_species) }));
  if (detail.held_item) add(phrase('condition.holding', { item: item(detail.held_item) }));
  if (detail.min_happiness) add(phrase('condition.happiness'));
  if (detail.min_affection) add(phrase('condition.affection'));
  if (detail.min_beauty) add(phrase('condition.beauty'));
  if (detail.known_move) add(phrase('condition.knowsMove', { move: move(detail.known_move) }));
  if (detail.known_move_type) {
    add(phrase('condition.knowsMoveType', { type: typeName(detail.known_move_type) }));
  }
  if (detail.near_special_rock) {
    const rock = SPECIAL_ROCKS[speciesName as keyof typeof SPECIAL_ROCKS];
    add(phrase(rock ?? 'condition.specialRock'));
  } else if (detail.location) {
    if (generalLocation) add(phrase('condition.specialPlaces'));
    else add(phrase('condition.at', { location: location(detail.location) }));
  }
  const time = TIME_OF_DAY[detail.time_of_day as keyof typeof TIME_OF_DAY];
  if (time) add(phrase(time));
  if (detail.relative_physical_stats === 1) add(phrase('condition.attackHigher'));
  if (detail.relative_physical_stats === -1) add(phrase('condition.attackLower'));
  if (detail.relative_physical_stats === 0) add(phrase('condition.attackEqual'));
  if (detail.party_species) add(phrase('condition.partySpecies', { pokemon: species(detail.party_species) }));
  if (detail.party_type) add(phrase('condition.partyType', { type: typeName(detail.party_type) }));
  if (detail.needs_overworld_rain) add(phrase('condition.rain'));
  if (detail.turn_upside_down) add(phrase('condition.upsideDown'));
  if (detail.needs_multiplayer) add(phrase('condition.multiplayer'));
  if (detail.min_steps) {
    add(phrase('condition.steps', { steps: detail.min_steps.toLocaleString(getLocale()) }));
  }
  if (detail.allowed_natures?.length) add(phrase('condition.natures'));
  return conditions;
}

/** «Livello 16», «Sale di livello con amicizia alta, di notte», «Usa Pietrafocaia». */
function describe(
  detail: EvolutionDetailResponse,
  speciesName: string,
  generalLocation = false,
): EvolutionMethod {
  let parts = describeTrigger(detail);
  const conditions = describeConditions(detail, speciesName, generalLocation);
  if (conditions.length) {
    const separator = text(t('evolution:method.separator'));
    const joined = conditions.flatMap((condition, i) => (i === 0 ? condition : [separator, ...condition]));
    parts = phrase('method.full', { trigger: parts, conditions: joined });
  }
  if (detail.gender === 1) parts = phrase('method.femaleOnly', { method: parts });
  if (detail.gender === 2) parts = phrase('method.maleOnly', { method: parts });
  const chance = detail.condition_expression?.percentage_chance;
  if (chance) parts = phrase('method.chance', { method: parts, chance: chance.toLocaleString(getLocale()) });

  // Unisce i pezzi di testo vicini: restano separati solo i collegamenti.
  return parts.reduce<EvolutionMethod>((merged, part) => {
    const last = merged.at(-1);
    if (part.kind === 'text' && last?.kind === 'text') {
      merged[merged.length - 1] = text(last.text + part.text);
    } else {
      merged.push(part);
    }
    return merged;
  }, []);
}

const methodKey = (method: EvolutionMethod) => method.map((part) => part.text).join('');

function uniqueMethods(methods: EvolutionMethod[], exclude = new Set<string>()): EvolutionMethod[] {
  const seen = new Set(exclude);
  return methods.filter((method) => {
    const key = methodKey(method);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * PokéAPI ha una voce per gioco e per forma. Metodi principali: quelli marcati `is_default`
 * (i giochi recenti) della forma base, senza le forme regionali (es. Raichu di Alola).
 * Gli altri della forma base, se dicono qualcosa di diverso, sono i metodi dei giochi precedenti.
 */
function toMethods(details: EvolutionDetailResponse[], speciesName: string) {
  const isBaseForm = (detail: EvolutionDetailResponse) =>
    !detail.region && (!detail.evolved_pokemon_form || detail.evolved_pokemon_form.name === speciesName);
  const defaults = details.filter((detail) => detail.is_default);
  const baseDefaults = defaults.filter(isBaseForm);
  const baseForm = details.filter(isBaseForm);
  const main = baseDefaults.length
    ? baseDefaults
    : defaults.length
      ? defaults
      : baseForm.length
        ? baseForm
        : details;

  let methods = uniqueMethods(main.map((detail) => describe(detail, speciesName)));
  if (methods.length > MAX_METHODS) {
    const others = methods.length - (MAX_METHODS - 1);
    methods = [...methods.slice(0, MAX_METHODS - 1), phrase('method.more', { count: others })];
  }
  const legacyMethods = uniqueMethods(
    baseForm.filter((detail) => !main.includes(detail)).map((detail) => describe(detail, speciesName, true)),
    new Set(methods.map(methodKey)),
  ).slice(0, MAX_LEGACY_METHODS);
  return { methods, legacyMethods };
}

function toStage(link: ChainLinkResponse): EvolutionStage {
  return {
    id: getIdFromUrl(link.species.url),
    name: link.species.name,
    isBaby: link.is_baby,
    ...toMethods(link.evolution_details, link.species.name),
    evolvesTo: link.evolves_to.map(toStage),
  };
}

const countStages = (stage: EvolutionStage): number =>
  1 + stage.evolvesTo.reduce((sum, next) => sum + countStages(next), 0);

export function toEvolutionChain(raw: EvolutionChainResponse): EvolutionChain {
  const root = toStage(raw.chain);
  return { id: raw.id, root, size: countStages(root) };
}

export async function fetchEvolutionChain(id: number, signal?: AbortSignal): Promise<EvolutionChain> {
  const raw = await fetchJson<EvolutionChainResponse>(
    `/evolution-chain/${id}`,
    signal,
    t('evolution:chain.notFound'),
  );
  return toEvolutionChain(raw);
}
