import { fetchJson } from '@/api/client';
import { getIdFromUrl } from '@/api/pokemon';
import itemIndex from '@/data/itemIndex.json';
import locationIndex from '@/data/locationIndex.json';
import moveIndex from '@/data/moveIndex.json';
import { TYPE_NAMES_IT } from '@/theme/typeNames';
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

// Nomi italiani dagli indici locali, per slug: nessuna chiamata per oggetto, mossa o luogo.
const ITEMS = new Map((itemIndex as ItemIndexEntry[]).map((entry) => [entry.name, entry]));
const MOVES = new Map((moveIndex as MoveIndexEntry[]).map((entry) => [entry.name, entry.label]));
const LOCATIONS = new Map(
  (locationIndex as LocationIndexEntry[]).map((entry) => [entry.name, entry]),
);

/** Al massimo tanti metodi per passaggio, per non affollare la scheda (Alcremie ne ha 63). */
const MAX_METHODS = 4;
const MAX_LEGACY_METHODS = 3;

const TIME_OF_DAY: Record<string, string> = {
  day: 'di giorno',
  night: 'di notte',
  dusk: 'al crepuscolo',
  'full-moon': 'con la luna piena',
};

/** Le rocce di Leafeon e Glaceon (`near_special_rock`). */
const SPECIAL_ROCKS: Record<string, string> = {
  leafeon: 'vicino alla roccia di muschio',
  glaceon: 'vicino alla roccia di ghiaccio',
};

const text = (value: string): EvolutionTextPart => ({ kind: 'text', text: value });

function item(resource: NamedAPIResource): EvolutionTextPart {
  const entry = ITEMS.get(resource.name);
  return entry
    ? { kind: 'item', text: entry.label, itemId: entry.id }
    : text(formatName(resource.name));
}

function location(resource: NamedAPIResource): EvolutionTextPart {
  const entry = LOCATIONS.get(resource.name);
  return entry
    ? { kind: 'location', text: entry.label, locationId: entry.id }
    : text(formatName(resource.name));
}

const move = (resource: NamedAPIResource) => MOVES.get(resource.name) ?? formatName(resource.name);

function typeName(resource: NamedAPIResource): string {
  return (TYPE_NAMES as readonly string[]).includes(resource.name)
    ? TYPE_NAMES_IT[resource.name as TypeName]
    : formatName(resource.name);
}

/** Inizio della frase, dal tipo di evoluzione (`trigger`). */
function describeTrigger(detail: EvolutionDetailResponse): EvolutionTextPart[] {
  const level = detail.min_level;
  const times = detail.min_move_count ? ` ${detail.min_move_count} volte` : '';
  switch (detail.trigger.name) {
    case 'level-up':
      return [text(level ? `Livello ${level}` : 'Sale di livello')];
    case 'in-battle-level-up':
      return [text(level ? `Livello ${level} durante una lotta` : 'Sale di livello durante una lotta')];
    case 'use-item':
      return detail.item ? [text('Usa '), item(detail.item)] : [text('Usa uno strumento')];
    case 'trade':
      return [text('Scambio')];
    case 'shed':
      return [text("Compare all'evoluzione di Nincada con un posto libero in squadra e una Poké Ball")];
    case 'spin':
      return [text('Fai una giravolta')];
    case 'tower-of-darkness':
      return [text('Supera la Torre del Buio')];
    case 'tower-of-waters':
      return [text("Supera la Torre dell'Acqua")];
    case 'three-critical-hits':
      return [text('3 brutti colpi nella stessa lotta')];
    case 'take-damage':
      return [
        text(
          detail.min_damage_taken
            ? `Subisci almeno ${detail.min_damage_taken} PS di danni senza andare KO`
            : 'Subisci danni senza andare KO',
        ),
      ];
    case 'recoil-damage':
      return [
        text(
          detail.min_damage_taken
            ? `Subisci almeno ${detail.min_damage_taken} PS di danni da contraccolpo`
            : 'Subisci danni da contraccolpo',
        ),
      ];
    case 'agile-style-move':
    case 'strong-style-move': {
      const style = detail.trigger.name === 'agile-style-move' ? 'Stile Rapido' : 'Stile Forte';
      return [text(detail.used_move ? `Usa ${move(detail.used_move)} in ${style}${times}` : `Usa una mossa in ${style}`)];
    }
    case 'use-move':
      return [text(detail.used_move ? `Usa ${move(detail.used_move)}${times}` : 'Usa una mossa')];
    case 'three-defeated-bisharp':
      return [text('Sconfiggi 3 Bisharp capobanda')];
    case 'meltan-candies':
      return [text('400 caramelle Meltan in Pokémon GO')];
    case 'gimmighoul-coins':
      return [text('Raccogli 999 Monete di Gimmighoul')];
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
  const add = (...parts: EvolutionTextPart[]) => conditions.push(parts);

  if (detail.trade_species) add(text(`con ${formatName(detail.trade_species.name)}`));
  if (detail.held_item) add(text('tenendo '), item(detail.held_item));
  if (detail.min_happiness) add(text('con amicizia alta'));
  if (detail.min_affection) add(text('con affetto alto'));
  if (detail.min_beauty) add(text('con Bellezza alta'));
  if (detail.known_move) add(text(`conoscendo ${move(detail.known_move)}`));
  if (detail.known_move_type) add(text(`conoscendo una mossa di tipo ${typeName(detail.known_move_type)}`));
  if (detail.near_special_rock) {
    add(text(SPECIAL_ROCKS[speciesName] ?? 'vicino a una roccia speciale'));
  } else if (detail.location) {
    if (generalLocation) add(text('in luoghi particolari'));
    else add(text('a '), location(detail.location));
  }
  if (detail.time_of_day && TIME_OF_DAY[detail.time_of_day]) add(text(TIME_OF_DAY[detail.time_of_day]));
  if (detail.relative_physical_stats === 1) add(text('con Attacco maggiore di Difesa'));
  if (detail.relative_physical_stats === -1) add(text('con Attacco minore di Difesa'));
  if (detail.relative_physical_stats === 0) add(text('con Attacco uguale a Difesa'));
  if (detail.party_species) add(text(`con ${formatName(detail.party_species.name)} in squadra`));
  if (detail.party_type) add(text(`con un Pokémon di tipo ${typeName(detail.party_type)} in squadra`));
  if (detail.needs_overworld_rain) add(text('mentre piove'));
  if (detail.turn_upside_down) add(text('tenendo la console capovolta'));
  if (detail.needs_multiplayer) add(text('giocando in multigiocatore'));
  if (detail.min_steps) add(text(`dopo ${detail.min_steps.toLocaleString('it-IT')} passi in modalità Let's Go`));
  if (detail.allowed_natures?.length) add(text('con certe nature'));
  return conditions;
}

/** «Livello 16», «Sale di livello con amicizia alta, di notte», «Usa Pietrafocaia». */
function describe(
  detail: EvolutionDetailResponse,
  speciesName: string,
  generalLocation = false,
): EvolutionMethod {
  const parts = describeTrigger(detail);
  describeConditions(detail, speciesName, generalLocation).forEach((condition, i) => {
    parts.push(text(i === 0 ? ' ' : ', '), ...condition);
  });
  if (detail.gender === 1) parts.push(text(' (solo femmine)'));
  if (detail.gender === 2) parts.push(text(' (solo maschi)'));
  const chance = detail.condition_expression?.percentage_chance;
  if (chance) parts.push(text(` (${chance.toLocaleString('it-IT')}% di probabilità)`));

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
    methods = [...methods.slice(0, MAX_METHODS - 1), [text(`…e altri ${others} modi`)]];
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
    'Catena evolutiva non trovata.',
  );
  return toEvolutionChain(raw);
}
