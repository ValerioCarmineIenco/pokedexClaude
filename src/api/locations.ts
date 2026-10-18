import { fetchJson } from '@/api/client';
import { LAST_POKEMON_ID } from '@/api/generations';
import { getArtworkUrl, getIdFromUrl } from '@/api/pokemon';
import encounterMeta from '@/data/encounterMeta.json';
import locationIndex from '@/data/locationIndex.json';
import pokemonIndex from '@/data/pokemonIndex.json';
import { getLocale, perLanguage, t } from '@/i18n';
import { localName, pokemonName } from '@/i18n/names';
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
  PokemonEncounterGroup,
  PokemonEncounterLocation,
} from '@/types/location';
import type {
  LocationAreaResponse,
  LocationResponse,
  PokemonEncounterResponse,
} from '@/types/pokeapi';
import { formatInteger, formatName } from '@/utils/format';
import { byLanguage, localized } from '@/utils/pokeapiText';
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

const METHODS = new Map(META.methods.map((m) => [m.name, m]));
const CONDITIONS = new Map(META.conditions.map((c) => [c.name, c]));

/** Nome della località nella lingua in uso; l'etichetta dell'indice se PokéAPI non lo ha. */
const locationLabel = (entry: LocationIndexEntry) => localName('location', entry.id, entry.label);

// Regioni e giochi con il nome nella lingua in uso: ricostruiti al cambio di lingua.
const regions = perLanguage(
  () =>
    new Map<string, LocationRegion>(
      META.regions.map((r) => [r.name, { id: r.id, name: r.name, label: localName('region', r.id, r.label) }]),
    ),
);
const versions = perLanguage(
  () =>
    new Map<number, GameVersion>(
      META.versions.map((v) => [
        v.id,
        { id: v.id, name: v.name, label: localName('version', v.id, v.label), generation: v.generation },
      ]),
    ),
);
const VERSION_IDS_BY_NAME = new Map(META.versions.map((v) => [v.name, v.id]));

const byGameOrder = (a: GameVersion, b: GameVersion) => a.generation - b.generation || a.id - b.id;
const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, getLocale());

function toSummary(entry: LocationIndexEntry): LocationSummary {
  const versionsById = versions();
  const regionsByName = regions();
  const games = entry.versionIds
    .map((id) => versionsById.get(id))
    .filter((v): v is GameVersion => !!v)
    .sort(byGameOrder);
  return {
    id: entry.id,
    slug: entry.name,
    name: locationLabel(entry),
    englishName: entry.englishLabel ?? entry.label,
    region: entry.region ? (regionsByName.get(entry.region) ?? null) : null,
    pokemonCount: entry.pokemonIds.length,
    gameCount: games.length,
    versions: games,
  };
}

/** Riepiloghi, elenco alfabetico e testo di ricerca nella lingua in uso. */
const tables = perLanguage(() => {
  const summaries = new Map(INDEX.map((entry) => [entry.id, toSummary(entry)]));
  // Testo su cui cerca `search`: nome mostrato, nome inglese e slug («petroglifari ambrette»).
  const searchText = new Map(
    [...summaries.values()].map((summary) => [
      summary.id,
      normalizeSearch(`${summary.name} ${summary.englishName} ${summary.slug.replace(/-/g, ' ')}`),
    ]),
  );
  return { summaries, sorted: [...summaries.values()].sort(byName), searchText };
});

/**
 * Regioni con almeno una località, in ordine di uscita (Kanto, Johto, Hoenn…).
 * Hisui e Paldea non ci sono: PokéAPI non ha gli incontri di quei giochi.
 */
export const getLocationRegions = perLanguage((): LocationRegion[] =>
  [...regions().values()]
    .filter((region) => INDEX.some((entry) => entry.region === region.name))
    .sort((a, b) => a.id - b.id),
);

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
  const { sorted, searchText } = tables();
  return sorted.filter(
    (location) =>
      (!region || location.region?.name === region) &&
      (!needle || searchText.get(location.id)!.includes(needle)),
  );
}

/** Le località raggruppate per regione (sezioni vuote escluse), per un elenco con intestazioni. */
export function getLocationSections(search = ''): LocationSection[] {
  const matches = getLocations({ search });
  const sections: LocationSection[] = getLocationRegions().map((region) => ({
    region,
    locations: matches.filter((location) => location.region?.name === region.name),
  }));
  const withoutRegion = matches.filter((location) => !location.region);
  if (withoutRegion.length > 0) sections.push({ region: null, locations: withoutRegion });
  return sections.filter((section) => section.locations.length > 0);
}

export function getLocationSummary(id: number): LocationSummary | undefined {
  return tables().summaries.get(id);
}

/** Converte il parametro di rotta (`"614"`) in un id dell'indice, altrimenti null. */
export function parseLocationId(value: string | string[] | number | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  return Number.isInteger(id) && BY_ID.has(id) ? id : null;
}

// --- Metodi e condizioni ------------------------------------------------------

/**
 * Metodi con nome breve e spiegazione tradotti (`locations:methods.*`); PokéAPI ha solo una
 * descrizione, e non in tutte le lingue.
 */
const TRANSLATED_METHODS = new Set([
  'walk', 'old-rod', 'good-rod', 'super-rod', 'surf', 'rock-smash', 'headbutt', 'headbutt-low',
  'headbutt-normal', 'headbutt-high', 'dark-grass', 'grass-spots', 'cave-spots', 'bridge-spots',
  'super-rod-spots', 'surf-spots', 'yellow-flowers', 'purple-flowers', 'red-flowers', 'rough-terrain',
  'gift', 'gift-egg', 'static', 'pokeflute', 'squirt-bottle', 'wailmer-pail', 'seaweed', 'roaming-grass',
  'roaming-water', 'devon-scope', 'feebas-tile-fishing', 'island-scan', 'sos', 'bubbling-spots',
  'berry-trees', 'npc-trade', 'sos-from-bubbling-spot', 'overworld', 'overworld-water', 'overworld-flying',
  'overworld-special', 'overworld-flying-special', 'overworld-water-special', 'overworld-dirt', 'horde',
  'colosseum-bonus-disc-us', 'colosseum-bonus-disc-jpn', 'pokemon-channel-pal', 'pokemon-ranger',
  'pokemon-battle-revolution', 'new-york-pokecenter-wish-eggs', 'snag', 'snag-rematch', 'pokespot',
  'hidden-grotto', 'honey-tree', 'wanderer', 'wanderer-water', 'chase-water', 'dynamax-adventure',
  'max-raid', 'trash-can-ambush', 'rustling-bush-ambush', 'ceiling-ambush', 'ground-ambush', 'sky-ambush',
] as const);
type TranslatedMethod = typeof TRANSLATED_METHODS extends Set<infer T> ? T : never;
const isTranslatedMethod = (name: string): name is TranslatedMethod =>
  (TRANSLATED_METHODS as Set<string>).has(name);

export function getEncounterMethod(name: string): EncounterMethod {
  if (isTranslatedMethod(name)) {
    return {
      name,
      label: t(`locations:methods.${name}.label`),
      description: t(`locations:methods.${name}.description`),
    };
  }
  // Metodo nuovo di PokéAPI: la sua descrizione nella lingua in uso, se c'è.
  const meta = METHODS.get(name);
  const description = meta ? localName('encounterMethod', meta.id, meta.label) : '';
  return { name, label: description || formatName(name), description };
}

const TIME_OF_DAY = ['morning', 'day', 'night'] as const;
const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const WEATHER = [
  'normal', 'overcast', 'raining', 'thunderstorm', 'snowing', 'snowstorm', 'sandstorm', 'intense-sun', 'fog',
] as const;
const FIXED_CONDITIONS = [
  'swarm-yes', 'swarm-no', 'radar-on', 'radar-off', 'radio-off', 'radio-hoenn', 'radio-sinnoh',
  'slot2-none', 'headbutt-tree-common', 'headbutt-tree-rare', 'headbutt-tree-secret',
] as const;

const oneOf = <T extends string>(list: readonly T[], value: string | undefined): value is T =>
  value !== undefined && (list as readonly string[]).includes(value);

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

/** Id nazionale dallo slug della specie (`bulbasaur` → 1), per gli starter e gli scambi. */
const POKEMON_IDS = new Map((pokemonIndex as { id: number; name: string }[]).map((p) => [p.name, p.id]));
const REGIONAL_SUFFIXES: Record<string, number> = { alola: 7, galar: 8, hisui: 9, paldea: 10 };

/** Nome di un Pokémon da uno slug delle condizioni: `meowth-galar`, `togepi-or-togetic`. */
function conditionPokemon(slug: string): string {
  const alternatives = slug.split('-or-');
  if (alternatives.length === 2) {
    return t('locations:conditions.either', {
      first: conditionPokemon(alternatives[0]),
      second: conditionPokemon(alternatives[1]),
    });
  }
  const id = POKEMON_IDS.get(slug);
  if (id) return pokemonName(id, slug);
  const [, base, suffix] = slug.match(/^(.+)-([a-z]+)$/) ?? [];
  const baseId = base ? POKEMON_IDS.get(base) : undefined;
  if (baseId && REGIONAL_SUFFIXES[suffix]) {
    return t('locations:conditions.regionalForm', {
      name: pokemonName(baseId, base),
      region: localName('region', REGIONAL_SUFFIXES[suffix], formatName(suffix)),
    });
  }
  return formatName(slug);
}

/** Testo tradotto dei valori più comuni, null se resta il nome di PokéAPI. */
function translatedCondition(name: string): string | null {
  if (oneOf(FIXED_CONDITIONS, name)) return t(`locations:conditions.fixed.${name}`);
  const [, prefix, rest] = name.match(/^([a-z0-9]+)-(.+)$/) ?? [];
  switch (prefix) {
    case 'time': {
      if (oneOf(TIME_OF_DAY, rest)) return t(`locations:conditions.time.${rest}`);
      const minutes = rest.match(/^minute-(\d+)-to-(\d+)$/);
      if (minutes) return t('locations:conditions.minutes', { from: minutes[1], to: minutes[2] });
      const hours = rest.match(/^(\d+)-(\d+)-to-(\d+)-(\d+)$/);
      if (hours) {
        return t('locations:conditions.hours', {
          from: `${hours[1]}:${hours[2]}`,
          to: `${hours[3]}:${hours[4]}`,
        });
      }
      return null;
    }
    case 'season':
      return oneOf(SEASONS, rest) ? t(`locations:conditions.season.${rest}`) : null;
    case 'weekday':
      return oneOf(WEEKDAYS, rest) ? t(`locations:conditions.weekday.${rest}`) : null;
    case 'weather':
      return oneOf(WEATHER, rest)
        ? t('locations:conditions.weatherLabel', { weather: t(`locations:conditions.weather.${rest}`) })
        : null;
    case 'coins':
      return t('locations:conditions.coins', { count: Number(rest), coins: formatInteger(Number(rest)) });
    case 'slot2': {
      const id = VERSION_IDS_BY_NAME.get(rest);
      return id ? t('locations:conditions.slot2', { game: versions().get(id)!.label }) : null;
    }
    case 'starter':
      return t('locations:conditions.starter', { pokemon: conditionPokemon(rest) });
    case 'trade':
      return rest === 'any-pokemon'
        ? t('locations:conditions.tradeAny')
        : t('locations:conditions.trade', { pokemon: conditionPokemon(rest) });
    default:
      return null;
  }
}

export function getEncounterCondition(name: string): EncounterCondition {
  const meta = CONDITIONS.get(name);
  return {
    name,
    condition: meta?.condition ?? name.split('-')[0],
    label:
      translatedCondition(name) ??
      (meta ? localName('encounterCondition', meta.id, meta.label) : formatName(name)),
    isDefault: DEFAULT_CONDITIONS.has(name),
  };
}

// --- Dettaglio ----------------------------------------------------------------

/** Nome inglese, altrimenti lo slug leggibile. */
const englishOf = (raw: { name: string; names: LocationResponse['names'] }) =>
  raw.names.find(byLanguage('en'))?.name ?? formatName(raw.name);

/** Nome nella lingua in uso, altrimenti inglese, altrimenti lo slug leggibile. */
const localOf = (raw: { name: string; names: LocationResponse['names'] }) =>
  localized(raw.names)?.name ?? formatName(raw.name);

/**
 * Nome breve dell'area: «Dark Cave (Violet City entrance)» → «Violet City entrance»,
 * «Celadon City Prize Corner» → «Prize Corner», «Celadon City» → «Principale».
 */
function areaName(area: LocationAreaResponse, location: LocationResponse, displayName: string): string {
  const main = t('locations:detail.mainArea');
  // L'area principale ha lo slug `{località}-area` (o `-main`), anche quando il nome inglese
  // non ripete quello della località («Road 16» per «Route 16»).
  const suffix = area.name.startsWith(`${location.name}-`) ? area.name.slice(location.name.length + 1) : null;
  if (suffix === 'area' || suffix === 'main') return main;
  const own = localOf(area);
  const prefixes = [displayName, localOf(location), englishOf(location)];
  for (const prefix of prefixes) {
    if (!own.toLowerCase().startsWith(prefix.toLowerCase())) continue;
    const rest = own
      .slice(prefix.length)
      .trim()
      .replace(/^[-–:,]\s*/, '')
      .replace(/^\((.*)\)$/, '$1')
      .trim();
    return rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : main;
  }
  return own;
}

const methodOrder = (name: string) => METHODS.get(name)?.order ?? Number.MAX_SAFE_INTEGER;

/** Raggruppa gli incontri di un'area per metodo, unendo i giochi con gli stessi dati. */
function toMethodGroups(area: LocationAreaResponse): EncounterMethodGroup[] {
  const versionsById = versions();
  // metodo → chiave (Pokémon, condizioni, livelli, probabilità) → voce
  const groups = new Map<string, Map<string, LocationEncounter>>();

  for (const { pokemon, version_details } of area.pokemon_encounters) {
    const pokemonId = getIdFromUrl(pokemon.url);
    for (const detail of version_details) {
      const version = versionsById.get(getIdFromUrl(detail.version.url));
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
            label: pokemonName(pokemonId, pokemon.name),
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
            a.pokemon.label.localeCompare(b.pokemon.label, getLocale()) ||
            a.versions[0].generation - b.versions[0].generation ||
            a.versions[0].id - b.versions[0].id ||
            a.minLevel - b.minLevel,
        ),
    }));
}

export function toLocationDetail(raw: LocationResponse, areas: LocationAreaResponse[]): LocationDetail {
  const summary = getLocationSummary(raw.id);
  const versionsById = versions();
  const english = englishOf(raw);
  const name = summary?.name ?? localOf(raw);
  const region = raw.region ? (regions().get(raw.region.name) ?? null) : null;

  const pokemonIds = new Set<number>();
  const versionIds = new Set<number>();
  for (const area of areas) {
    for (const encounter of area.pokemon_encounters) {
      pokemonIds.add(getIdFromUrl(encounter.pokemon.url));
      for (const detail of encounter.version_details) versionIds.add(getIdFromUrl(detail.version.url));
    }
  }
  const games = [...versionIds]
    .map((id) => versionsById.get(id))
    .filter((v): v is GameVersion => !!v)
    .sort(byGameOrder);

  return {
    id: raw.id,
    slug: raw.name,
    name,
    englishName: summary?.englishName ?? english,
    region,
    pokemonCount: pokemonIds.size,
    gameCount: games.length,
    versions: games,
    areas: areas
      .filter((area) => area.pokemon_encounters.length > 0)
      .map(
        (area): LocationArea => ({
          id: area.id,
          slug: area.name,
          name: areaName(area, raw, name),
          methods: toMethodGroups(area),
        }),
      ),
  };
}

/** Dettaglio di una località: la località e tutte le sue aree, scaricate in parallelo. */
export async function getLocation(id: number, signal?: AbortSignal): Promise<LocationDetail> {
  const notFound = t('locations:errors.notFound');
  const raw = await fetchJson<LocationResponse>(`/location/${id}`, signal, notFound);
  const areas = await Promise.all(
    raw.areas.map((area) =>
      fetchJson<LocationAreaResponse>(`/location-area/${getIdFromUrl(area.url)}`, signal, notFound),
    ),
  );
  return toLocationDetail(raw, areas);
}

// --- Dove trovare un Pokémon --------------------------------------------------

/** Slug delle località, dal più lungo: «kanto-route-22» va provato prima di «kanto-route-2». */
const SLUGS_BY_LENGTH = [...INDEX].sort((a, b) => b.name.length - a.name.length);

/**
 * Località di un'area dal suo slug: le aree si chiamano `{località}-{zona}`
 * (`viridian-forest-area`, `mt-moon-1f`). Null se nessuna località dell'indice combacia.
 */
export function getLocationIdForArea(areaSlug: string): number | null {
  const match = SLUGS_BY_LENGTH.find(
    (entry) => areaSlug === entry.name || areaSlug.startsWith(`${entry.name}-`),
  );
  return match?.id ?? null;
}

export function toPokemonEncounterGroups(
  raw: PokemonEncounterResponse[],
  /** Località delle aree che lo slug non basta a trovare, per id dell'area. */
  extraAreas: Map<number, number> = new Map(),
): PokemonEncounterGroup[] {
  const versionsById = versions();
  const summaries = tables().summaries;
  // gioco → località → metodi
  const byVersion = new Map<number, Map<number, Set<string>>>();
  for (const entry of raw) {
    const areaId = getIdFromUrl(entry.location_area.url);
    const locationId = getLocationIdForArea(entry.location_area.name) ?? extraAreas.get(areaId);
    if (locationId === undefined || locationId === null || !BY_ID.has(locationId)) continue;
    for (const detail of entry.version_details) {
      const versionId = getIdFromUrl(detail.version.url);
      if (!versionsById.has(versionId)) continue;
      let locations = byVersion.get(versionId);
      if (!locations) byVersion.set(versionId, (locations = new Map()));
      let methods = locations.get(locationId);
      if (!methods) locations.set(locationId, (methods = new Set()));
      for (const slot of detail.encounter_details) methods.add(slot.method.name);
    }
  }

  // I giochi con le stesse località e gli stessi metodi finiscono nello stesso gruppo.
  const groups = new Map<string, PokemonEncounterGroup>();
  const games = [...byVersion.keys()].map((id) => versionsById.get(id)!).sort(byGameOrder);
  for (const version of games) {
    const locations: PokemonEncounterLocation[] = [...byVersion.get(version.id)!.entries()]
      .map(([id, methods]) => ({
        id,
        name: summaries.get(id)!.name,
        methods: [...methods].sort((a, b) => methodOrder(a) - methodOrder(b)).map(getEncounterMethod),
      }))
      .sort(byName);
    const key = locations.map((l) => `${l.id}:${l.methods.map((m) => m.name).join(',')}`).join('|');
    const existing = groups.get(key);
    if (existing) existing.versions.push(version);
    else groups.set(key, { versions: [version], locations });
  }
  return [...groups.values()];
}

/**
 * Luoghi in cui si incontra un Pokémon, per gioco. Vuoto se non si trova in natura
 * (si ottiene solo evolvendo, da un uovo o con un evento) o se PokéAPI non ha i dati del gioco.
 */
export async function getPokemonEncounters(
  pokemonId: number,
  signal?: AbortSignal,
): Promise<PokemonEncounterGroup[]> {
  const raw = await fetchJson<PokemonEncounterResponse[]>(`/pokemon/${pokemonId}/encounters`, signal);
  // Raro: un'area il cui slug non comincia con quello della località. Si chiede a PokéAPI.
  const unknown = [
    ...new Set(
      raw
        .filter((entry) => getLocationIdForArea(entry.location_area.name) === null)
        .map((entry) => getIdFromUrl(entry.location_area.url)),
    ),
  ];
  const extraAreas = new Map<number, number>();
  await Promise.all(
    unknown.map(async (areaId) => {
      const area = await fetchJson<LocationAreaResponse>(`/location-area/${areaId}`, signal);
      extraAreas.set(areaId, getIdFromUrl(area.location.url));
    }),
  );
  return toPokemonEncounterGroups(raw, extraAreas);
}
