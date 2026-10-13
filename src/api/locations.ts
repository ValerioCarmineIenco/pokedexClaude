import { fetchJson } from '@/api/client';
import { LAST_POKEMON_ID } from '@/api/generations';
import { getArtworkUrl, getIdFromUrl } from '@/api/pokemon';
import encounterMeta from '@/data/encounterMeta.json';
import locationIndex from '@/data/locationIndex.json';
import type {
  EncounterCondition,
  EncounterMethod,
  EncounterMethodGroup,
  GameVersion,
  LocationArea,
  LocationDetail,
  LocationEncounter,
  LocationIndexEntry,
  LocationRegion,
  LocationSection,
  LocationSummary,
} from '@/types/location';
import type { LocationAreaResponse, LocationResponse } from '@/types/pokeapi';
import { formatName } from '@/utils/format';
import { byLanguage } from '@/utils/pokeapiText';
import { normalizeSearch } from '@/utils/search';

type MetaEntry = { id: number; name: string; label: string };
type Meta = {
  regions: MetaEntry[];
  versions: (MetaEntry & { generation: number })[];
  methods: (MetaEntry & { order: number })[];
  conditions: (MetaEntry & { condition: string })[];
};

/**
 * Località con almeno un incontro, in ordine di id, e i nomi di regioni, giochi, metodi e
 * condizioni. Generati da `scripts/generate-location-index.mjs`.
 */
const INDEX = locationIndex as LocationIndexEntry[];
const META = encounterMeta as Meta;
const BY_ID = new Map(INDEX.map((entry) => [entry.id, entry]));

const REGIONS = new Map<string, LocationRegion>(
  META.regions.map((r) => [r.name, { id: r.id, name: r.name, label: r.label }]),
);
const VERSIONS = new Map<number, GameVersion>(
  META.versions.map((v) => [v.id, { id: v.id, name: v.name, label: v.label, generation: v.generation }]),
);
const VERSIONS_BY_NAME = new Map([...VERSIONS.values()].map((v) => [v.name, v]));
const METHODS = new Map(META.methods.map((m) => [m.name, m]));
const CONDITIONS = new Map(META.conditions.map((c) => [c.name, c]));

/** Testo su cui cerca `search`: nome mostrato, nome inglese e slug («petroglifari ambrette»). */
const SEARCH_TEXT = new Map(
  INDEX.map((entry) => [
    entry.id,
    normalizeSearch(`${entry.label} ${entry.englishLabel ?? ''} ${entry.name.replace(/-/g, ' ')}`),
  ]),
);

const byGameOrder = (a: GameVersion, b: GameVersion) => a.generation - b.generation || a.id - b.id;
const byName = (a: LocationSummary, b: LocationSummary) => a.name.localeCompare(b.name, 'it');

function toSummary(entry: LocationIndexEntry): LocationSummary {
  const versions = entry.versionIds
    .map((id) => VERSIONS.get(id))
    .filter((v): v is GameVersion => !!v)
    .sort(byGameOrder);
  return {
    id: entry.id,
    slug: entry.name,
    name: entry.label,
    englishName: entry.englishLabel ?? entry.label,
    region: entry.region ? (REGIONS.get(entry.region) ?? null) : null,
    pokemonCount: entry.pokemonIds.length,
    gameCount: versions.length,
    versions,
  };
}

const SUMMARIES = new Map(INDEX.map((entry) => [entry.id, toSummary(entry)]));
const ALL_SORTED = [...SUMMARIES.values()].sort(byName);

/**
 * Regioni con almeno una località, in ordine di uscita (Kanto, Johto, Hoenn…).
 * Hisui e Paldea non ci sono: PokéAPI non ha gli incontri di quei giochi.
 */
export const LOCATION_REGIONS: LocationRegion[] = [...REGIONS.values()]
  .filter((region) => INDEX.some((entry) => entry.region === region.name))
  .sort((a, b) => a.id - b.id);

/**
 * Località in ordine alfabetico, filtrate per regione (slug, es. `kanto`; null = tutte) e
 * per nome (`search`, anche parziale, senza distinzione di maiuscole e accenti; cerca anche
 * il nome inglese). Nessuna chiamata di rete.
 */
export function getLocations({
  region = null,
  search = '',
}: { region?: string | null; search?: string } = {}): LocationSummary[] {
  const needle = normalizeSearch(search);
  return ALL_SORTED.filter(
    (location) =>
      (!region || location.region?.name === region) &&
      (!needle || SEARCH_TEXT.get(location.id)!.includes(needle)),
  );
}

/** Le località raggruppate per regione (sezioni vuote escluse), per un elenco con intestazioni. */
export function getLocationSections(search = ''): LocationSection[] {
  const matches = getLocations({ search });
  const sections: LocationSection[] = LOCATION_REGIONS.map((region) => ({
    region,
    locations: matches.filter((location) => location.region?.name === region.name),
  }));
  const withoutRegion = matches.filter((location) => !location.region);
  if (withoutRegion.length > 0) sections.push({ region: null, locations: withoutRegion });
  return sections.filter((section) => section.locations.length > 0);
}

export function getLocationSummary(id: number): LocationSummary | undefined {
  return SUMMARIES.get(id);
}

/** Converte il parametro di rotta (`"614"`) in un id dell'indice, altrimenti null. */
export function parseLocationId(value: string | string[] | number | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  return Number.isInteger(id) && BY_ID.has(id) ? id : null;
}

// --- Metodi e condizioni ------------------------------------------------------

/** PokéAPI ha i metodi solo in inglese: nome breve e spiegazione come nei giochi. */
const METHOD_LABELS: Record<string, [label: string, description: string]> = {
  walk: ['Erba alta e grotte', 'Camminando nell’erba alta o in una grotta'],
  'old-rod': ['Amo Vecchio', 'Pescando con l’Amo Vecchio'],
  'good-rod': ['Amo Buono', 'Pescando con l’Amo Buono'],
  'super-rod': ['Super Amo', 'Pescando con il Super Amo'],
  surf: ['Surf', 'Facendo Surf sull’acqua'],
  'rock-smash': ['Spaccaroccia', 'Usando Spaccaroccia sulle rocce fragili'],
  headbutt: ['Bottintesta', 'Usando Bottintesta sugli alberi'],
  'headbutt-low': ['Bottintesta (raro)', 'Usando Bottintesta sugli alberi, con poche probabilità'],
  'headbutt-normal': ['Bottintesta', 'Usando Bottintesta sugli alberi'],
  'headbutt-high': ['Bottintesta (frequente)', 'Usando Bottintesta sugli alberi, con molte probabilità'],
  'dark-grass': ['Erba scura', 'Camminando nell’erba alta scura'],
  'grass-spots': ['Erba che si muove', 'Camminando nell’erba che si agita'],
  'cave-spots': ['Polvere nelle grotte', 'Camminando sulla polvere che si alza nelle grotte'],
  'bridge-spots': ['Ombre sui ponti', 'Camminando sulle ombre dei ponti'],
  'super-rod-spots': ['Increspature (pesca)', 'Pescando con il Super Amo nelle increspature'],
  'surf-spots': ['Increspature (Surf)', 'Facendo Surf nelle increspature'],
  'yellow-flowers': ['Fiori gialli', 'Camminando tra i fiori gialli'],
  'purple-flowers': ['Fiori viola', 'Camminando tra i fiori viola'],
  'red-flowers': ['Fiori rossi', 'Camminando tra i fiori rossi'],
  'rough-terrain': ['Terreno accidentato', 'Camminando sul terreno accidentato'],
  gift: ['Regalo', 'Pokémon ricevuto in regalo'],
  'gift-egg': ['Uovo in regalo', 'Uovo ricevuto in regalo'],
  static: ['Incontro fisso', 'Pokémon visibile in un punto preciso'],
  pokeflute: ['Poké Flauto', 'Svegliandolo con il Poké Flauto'],
  'squirt-bottle': ['Annaffiatoio', 'Usando l’Annaffiatoio sull’albero che si muove'],
  'wailmer-pail': ['Wailmissaffiatoio', 'Usando il Wailmissaffiatoio sull’albero che si muove'],
  seaweed: ['Alghe', 'Immergendosi tra le alghe'],
  'roaming-grass': ['Vagante (erba)', 'Pokémon vagante, nell’erba alta'],
  'roaming-water': ['Vagante (acqua)', 'Pokémon vagante, sull’acqua'],
  'devon-scope': ['Devonscopio', 'Usando il Devonscopio sul Pokémon invisibile'],
  'feebas-tile-fishing': ['Pesca di Feebas', 'Pescando nei punti speciali del fiume'],
  'island-scan': ['Scansione Isola', 'Usando la Scansione Isola'],
  sos: ['Chiamata SOS', 'Chiamato in aiuto da un Pokémon selvatico'],
  'bubbling-spots': ['Bolle (pesca)', 'Pescando dove l’acqua fa le bolle'],
  'berry-trees': ['Alberi di bacche', 'Raccogliendo le bacche dagli alberi'],
  'npc-trade': ['Scambio', 'Scambio con un personaggio del gioco'],
  'sos-from-bubbling-spot': ['SOS dalle bolle', 'Chiamato in aiuto da un Pokémon pescato nelle bolle'],
  overworld: ['Visibile', 'Pokémon visibile nell’ambiente'],
  'overworld-water': ['Visibile in acqua', 'Pokémon visibile sull’acqua'],
  'overworld-flying': ['Visibile in volo', 'Pokémon visibile in volo'],
  'overworld-special': ['Visibile (speciale)', 'Pokémon visibile in condizioni speciali'],
  'overworld-flying-special': ['Visibile in volo (speciale)', 'Pokémon visibile in volo, in condizioni speciali'],
  'overworld-water-special': ['Visibile in acqua (speciale)', 'Pokémon visibile sull’acqua, in condizioni speciali'],
  'overworld-dirt': ['Visibile sul terreno', 'Pokémon visibile che spunta dal terreno'],
  horde: ['Orda', 'Incontro con un’orda di cinque Pokémon'],
  'colosseum-bonus-disc-us': ['Disco bonus Colosseum (USA)', 'Dal disco bonus americano di Colosseum'],
  'colosseum-bonus-disc-jpn': ['Disco bonus Colosseum (JP)', 'Dal disco bonus giapponese di Colosseum'],
  'pokemon-channel-pal': ['Pokémon Channel', 'Da Pokémon Channel (versione europea)'],
  'pokemon-ranger': ['Pokémon Ranger', 'Trasferito da Pokémon Ranger'],
  'pokemon-battle-revolution': ['Battle Revolution', 'Da Pokémon Battle Revolution'],
  'new-york-pokecenter-wish-eggs': ['Uova del Pokémon Center NY', 'Uova dell’evento del Pokémon Center di New York'],
  snag: ['Cattura', 'Catturato a un allenatore con la Snag Machine'],
  'snag-rematch': ['Cattura (rivincita)', 'Catturato a un allenatore nella rivincita'],
  pokespot: ['Poképosto', 'Attirato al Poképosto con i Poképastelli'],
  'hidden-grotto': ['Meandro Nascosto', 'Trovato in un Meandro Nascosto'],
  'honey-tree': ['Albero di miele', 'Spalmando il Miele sull’albero'],
  wanderer: ['Vagabondo', 'Pokémon che si aggira nell’ambiente'],
  'wanderer-water': ['Vagabondo in acqua', 'Pokémon che si aggira sull’acqua'],
  'chase-water': ['Inseguimento in acqua', 'Pokémon che insegue in acqua'],
  'dynamax-adventure': ['Avventura Dynamax', 'Incontrato in un’Avventura Dynamax'],
  'max-raid': ['Raid Dynamax', 'Incontrato in un Raid Dynamax'],
  'trash-can-ambush': ['Agguato dal bidone', 'Salta fuori da un bidone dei rifiuti'],
  'rustling-bush-ambush': ['Agguato dal cespuglio', 'Salta fuori da un cespuglio che si muove'],
  'ceiling-ambush': ['Agguato dal soffitto', 'Cade dal soffitto'],
  'ground-ambush': ['Agguato dal terreno', 'Salta fuori dal terreno'],
  'sky-ambush': ['Agguato dal cielo', 'Piomba dal cielo'],
};

export function getEncounterMethod(name: string): EncounterMethod {
  const [label, description] = METHOD_LABELS[name] ?? [];
  const english = METHODS.get(name)?.label;
  return {
    name,
    label: label ?? english ?? formatName(name),
    description: description ?? english ?? '',
  };
}

const TIME_OF_DAY: Record<string, string> = { morning: 'Mattino', day: 'Giorno', night: 'Notte' };
const SEASONS: Record<string, string> = {
  spring: 'Primavera',
  summer: 'Estate',
  autumn: 'Autunno',
  winter: 'Inverno',
};
const WEEKDAYS: Record<string, string> = {
  monday: 'Lunedì',
  tuesday: 'Martedì',
  wednesday: 'Mercoledì',
  thursday: 'Giovedì',
  friday: 'Venerdì',
  saturday: 'Sabato',
  sunday: 'Domenica',
};
const WEATHER: Record<string, string> = {
  normal: 'Sereno',
  overcast: 'Nuvoloso',
  raining: 'Pioggia',
  thunderstorm: 'Temporale',
  snowing: 'Neve',
  snowstorm: 'Bufera di neve',
  sandstorm: 'Tempesta di sabbia',
  'intense-sun': 'Sole intenso',
  fog: 'Nebbia',
};
const FIXED_CONDITIONS: Record<string, string> = {
  'swarm-yes': 'Durante uno sciame',
  'swarm-no': 'Senza sciame',
  'radar-on': 'Con il Poké Radar',
  'radar-off': 'Senza Poké Radar',
  'radio-off': 'Radio spenta',
  'radio-hoenn': 'Musica di Hoenn alla radio',
  'radio-sinnoh': 'Musica di Sinnoh alla radio',
  'slot2-none': 'Nessuna cartuccia GBA',
  'headbutt-tree-common': 'Albero comune',
  'headbutt-tree-rare': 'Albero raro',
  'headbutt-tree-secret': 'Albero segreto',
};

/** Valori che descrivono il caso normale: nessun evento, oggetto o cartuccia particolare. */
const DEFAULT_CONDITIONS = new Set([
  'swarm-no',
  'radar-off',
  'radio-off',
  'slot2-none',
  'story-progress-none',
  'other-none',
  'item-none',
  'great-marsh-daily-slot-none',
  'johto-safari-blocks-inactive',
  'bug-catching-contest-no',
  'backlot-not-mentioned',
]);

/** Testo italiano dei valori più comuni, null se resta l'inglese di PokéAPI. */
function italianCondition(name: string): string | null {
  if (FIXED_CONDITIONS[name]) return FIXED_CONDITIONS[name];
  const [, prefix, rest] = name.match(/^([a-z0-9]+)-(.+)$/) ?? [];
  switch (prefix) {
    case 'time': {
      if (TIME_OF_DAY[rest]) return TIME_OF_DAY[rest];
      const minutes = rest.match(/^minute-(\d+)-to-(\d+)$/);
      if (minutes) return `Minuti ${minutes[1]}–${minutes[2]}`;
      const hours = rest.match(/^(\d+)-(\d+)-to-(\d+)-(\d+)$/);
      if (hours) return `Ore ${hours[1]}:${hours[2]}–${hours[3]}:${hours[4]}`;
      return null;
    }
    case 'season':
      return SEASONS[rest] ?? null;
    case 'weekday':
      return WEEKDAYS[rest] ?? null;
    case 'weather':
      return WEATHER[rest] ? `Meteo: ${WEATHER[rest]}` : null;
    case 'coins':
      return `${Number(rest).toLocaleString('it-IT')} gettoni`;
    case 'slot2': {
      const version = VERSIONS_BY_NAME.get(rest);
      return version ? `Con ${version.label} nello slot GBA` : null;
    }
    case 'starter':
      return `Starter scelto: ${formatName(rest)}`;
    case 'trade':
      return rest === 'any-pokemon' ? 'In cambio di un Pokémon qualsiasi' : `In cambio di ${formatName(rest)}`;
    default:
      return null;
  }
}

export function getEncounterCondition(name: string): EncounterCondition {
  const meta = CONDITIONS.get(name);
  return {
    name,
    condition: meta?.condition ?? name.split('-')[0],
    label: italianCondition(name) ?? meta?.label ?? formatName(name),
    isDefault: DEFAULT_CONDITIONS.has(name),
  };
}

// --- Dettaglio ----------------------------------------------------------------

/** Nome inglese, poi italiano, poi slug: aree e località hanno quasi sempre solo l'inglese. */
const englishOf = (raw: { name: string; names: LocationResponse['names'] }) =>
  raw.names.find(byLanguage('en'))?.name ?? formatName(raw.name);

/**
 * Nome breve dell'area: «Dark Cave (Violet City entrance)» → «Violet City entrance»,
 * «Celadon City Prize Corner» → «Prize Corner», «Celadon City» → «Principale».
 */
function areaName(area: LocationAreaResponse, location: LocationResponse): string {
  // L'area principale ha lo slug `{località}-area` (o `-main`), anche quando il nome inglese
  // non ripete quello della località («Road 16» per «Route 16»).
  const suffix = area.name.startsWith(`${location.name}-`) ? area.name.slice(location.name.length + 1) : null;
  if (suffix === 'area' || suffix === 'main') return 'Principale';
  const own = area.names.find(byLanguage('it'))?.name ?? englishOf(area);
  const prefixes = [location.names.find(byLanguage('it'))?.name, englishOf(location)].filter(
    (prefix): prefix is string => !!prefix,
  );
  for (const prefix of prefixes) {
    if (!own.toLowerCase().startsWith(prefix.toLowerCase())) continue;
    const rest = own
      .slice(prefix.length)
      .trim()
      .replace(/^[-–:,]\s*/, '')
      .replace(/^\((.*)\)$/, '$1')
      .trim();
    return rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : 'Principale';
  }
  return own;
}

const methodOrder = (name: string) => METHODS.get(name)?.order ?? Number.MAX_SAFE_INTEGER;

/** Raggruppa gli incontri di un'area per metodo, unendo i giochi con gli stessi dati. */
function toMethodGroups(area: LocationAreaResponse): EncounterMethodGroup[] {
  // metodo → chiave (Pokémon, condizioni, livelli, probabilità) → voce
  const groups = new Map<string, Map<string, LocationEncounter>>();

  for (const { pokemon, version_details } of area.pokemon_encounters) {
    const pokemonId = getIdFromUrl(pokemon.url);
    for (const detail of version_details) {
      const version = VERSIONS.get(getIdFromUrl(detail.version.url));
      if (!version) continue;

      // Ogni voce di PokéAPI è uno «slot»: si sommano le probabilità degli slot con lo stesso
      // metodo e le stesse condizioni, e si prende l'intervallo di livelli.
      const slots = new Map<string, { method: string; conditions: string[]; min: number; max: number; chance: number }>();
      for (const slot of detail.encounter_details) {
        const conditions = slot.condition_values.map((c) => c.name).sort();
        const key = `${slot.method.name}|${conditions.join(',')}`;
        const current = slots.get(key);
        if (current) {
          current.min = Math.min(current.min, slot.min_level);
          current.max = Math.max(current.max, slot.max_level);
          current.chance += slot.chance;
        } else {
          slots.set(key, {
            method: slot.method.name,
            conditions,
            min: slot.min_level,
            max: slot.max_level,
            chance: slot.chance,
          });
        }
      }

      for (const slot of slots.values()) {
        const chance = slot.chance > 0 ? Math.min(slot.chance, 100) : null;
        const key = `${pokemonId}|${slot.conditions.join(',')}|${slot.min}|${slot.max}|${chance}`;
        let byKey = groups.get(slot.method);
        if (!byKey) groups.set(slot.method, (byKey = new Map()));
        const existing = byKey.get(key);
        if (existing) {
          if (!existing.versions.some((v) => v.id === version.id)) existing.versions.push(version);
          continue;
        }
        byKey.set(key, {
          pokemon: {
            id: pokemonId,
            name: pokemon.name,
            artworkUrl: getArtworkUrl(pokemonId),
            inPokedex: pokemonId <= LAST_POKEMON_ID,
          },
          minLevel: slot.min,
          maxLevel: slot.max,
          chance,
          conditions: slot.conditions.map(getEncounterCondition),
          versions: [version],
        });
      }
    }
  }

  return [...groups.entries()]
    .sort(([a], [b]) => methodOrder(a) - methodOrder(b))
    .map(([method, byKey]) => ({
      method: getEncounterMethod(method),
      encounters: [...byKey.values()]
        .map((encounter) => ({ ...encounter, versions: encounter.versions.sort(byGameOrder) }))
        .sort(
          (a, b) =>
            a.pokemon.name.localeCompare(b.pokemon.name) ||
            a.versions[0].generation - b.versions[0].generation ||
            a.versions[0].id - b.versions[0].id ||
            a.minLevel - b.minLevel,
        ),
    }));
}

export function toLocationDetail(raw: LocationResponse, areas: LocationAreaResponse[]): LocationDetail {
  const summary = getLocationSummary(raw.id);
  const english = englishOf(raw);
  const name = raw.names.find(byLanguage('it'))?.name ?? english;
  const region = raw.region ? (REGIONS.get(raw.region.name) ?? null) : null;

  const pokemonIds = new Set<number>();
  const versionIds = new Set<number>();
  for (const area of areas) {
    for (const encounter of area.pokemon_encounters) {
      pokemonIds.add(getIdFromUrl(encounter.pokemon.url));
      for (const detail of encounter.version_details) versionIds.add(getIdFromUrl(detail.version.url));
    }
  }
  const versions = [...versionIds]
    .map((id) => VERSIONS.get(id))
    .filter((v): v is GameVersion => !!v)
    .sort(byGameOrder);

  return {
    id: raw.id,
    slug: raw.name,
    name: summary?.name ?? name,
    englishName: summary?.englishName ?? english,
    region,
    pokemonCount: pokemonIds.size,
    gameCount: versions.length,
    versions,
    areas: areas
      .filter((area) => area.pokemon_encounters.length > 0)
      .map(
        (area): LocationArea => ({
          id: area.id,
          slug: area.name,
          name: areaName(area, raw),
          methods: toMethodGroups(area),
        }),
      ),
  };
}

/** Dettaglio di una località: la località e tutte le sue aree, scaricate in parallelo. */
export async function getLocation(id: number, signal?: AbortSignal): Promise<LocationDetail> {
  const notFound = 'Località non trovata.';
  const raw = await fetchJson<LocationResponse>(`/location/${id}`, signal, notFound);
  const areas = await Promise.all(
    raw.areas.map((area) =>
      fetchJson<LocationAreaResponse>(`/location-area/${getIdFromUrl(area.url)}`, signal, notFound),
    ),
  );
  return toLocationDetail(raw, areas);
}
