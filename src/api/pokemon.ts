import { fetchJson } from '@/api/client';
import {
  FIRST_POKEMON_ID,
  getGenerationOfPokemon,
  getPokemonRange,
  LAST_POKEMON_ID,
} from '@/api/generations';
import pokemonIndex from '@/data/pokemonIndex.json';
import { getLocale, perLanguage, t } from '@/i18n';
import { pokemonName } from '@/i18n/names';
import type {
  PokemonListResponse,
  PokemonResponse,
  PokemonSpeciesResponse,
} from '@/types/pokeapi';
import {
  TYPE_NAMES,
  type Pokemon,
  type PokemonFilters,
  type PokemonSort,
  type PokemonSpecies,
  type PokemonSummary,
  type StatName,
  type TypeName,
} from '@/types/pokemon';
import { latestLocalizedFlavor, localized } from '@/utils/pokeapiText';
import { normalizeSearch } from '@/utils/search';

export const PAGE_SIZE = 20;

// Per chi già importava gli estremi da qui.
export { FIRST_POKEMON_ID, LAST_POKEMON_ID };

const SPRITES_BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

const STAT_NAMES: readonly string[] = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
] satisfies StatName[];

/**
 * Stili di artwork principale scelti nelle Impostazioni. Ogni URL si costruisce dall'id,
 * senza chiamate extra. Dream World e Showdown non coprono tutti i Pokémon: per quelli
 * senza immagine (`missingArtwork` nell'indice) si usa l'artwork ufficiale.
 */
const STYLES = [
  {
    id: 'official',
    path: (id: number) => `other/official-artwork/${id}.png`,
  },
  {
    id: 'official-shiny',
    path: (id: number) => `other/official-artwork/shiny/${id}.png`,
  },
  {
    id: 'home',
    path: (id: number) => `other/home/${id}.png`,
  },
  {
    id: 'home-shiny',
    path: (id: number) => `other/home/shiny/${id}.png`,
  },
  {
    id: 'dream-world',
    path: (id: number) => `other/dream-world/${id}.svg`,
  },
  {
    id: 'showdown',
    path: (id: number) => `other/showdown/${id}.gif`,
  },
  {
    id: 'sprite',
    path: (id: number) => `${id}.png`,
  },
] as const;

export type ArtworkStyle = (typeof STYLES)[number]['id'];

// Nome e descrizione si leggono nella lingua in uso a ogni accesso.
export const ARTWORK_STYLES = STYLES.map((style) => ({
  ...style,
  get label() {
    return t(`common:artworkStyles.${style.id}.label`);
  },
  get description() {
    return t(`common:artworkStyles.${style.id}.description`);
  },
}));

export const DEFAULT_ARTWORK_STYLE: ArtworkStyle = 'official';

export function isArtworkStyle(value: unknown): value is ArtworkStyle {
  return ARTWORK_STYLES.some((style) => style.id === value);
}

type PokemonIndexEntry = {
  id: number;
  name: string;
  types: string[];
  /** Statistiche base nell'ordine di `STAT_NAMES`. */
  stats: number[];
  legendary?: true;
  mythical?: true;
  baby?: true;
  missingArtwork?: string[];
};

/**
 * Tutti i Pokémon del Pokédex (id, nome, tipi, statistiche, categoria), in ordine di id, per
 * cercare e filtrare senza chiamate.
 * Generato da `scripts/generate-pokemon-index.mjs`.
 */
const INDEX = (pokemonIndex as PokemonIndexEntry[]).filter((entry) => entry.id <= LAST_POKEMON_ID);
const MISSING_ARTWORK = new Map(
  INDEX.flatMap((entry) => (entry.missingArtwork ? [[entry.id, entry.missingArtwork] as const] : [])),
);
/**
 * Testo su cui cerca `searchPokemonIndex`: il nome nella lingua in uso e lo slug inglese con
 * spazi al posto dei trattini («フシギダネ bulbasaur»).
 */
const getSearchText = perLanguage(
  () =>
    new Map(
      INDEX.map((entry) => [
        entry.id,
        normalizeSearch(`${pokemonName(entry.id, entry.name)} ${entry.name.replace(/-/g, ' ')}`),
      ]),
    ),
);

/** Artwork del Pokémon nello stile scelto (predefinito: artwork ufficiale). */
export function getArtworkUrl(id: number, style: ArtworkStyle = DEFAULT_ARTWORK_STYLE): string {
  const available = !MISSING_ARTWORK.get(id)?.includes(style);
  const entry = (available && ARTWORK_STYLES.find((s) => s.id === style)) || ARTWORK_STYLES[0];
  return `${SPRITES_BASE_URL}/${entry.path(id)}`;
}

// Versione shiny di ogni stile; Dream World non ne ha, ripiega sull'artwork ufficiale shiny.
const SHINY_PATHS: Record<ArtworkStyle, (id: number) => string> = {
  official: (id) => `other/official-artwork/shiny/${id}.png`,
  'official-shiny': (id) => `other/official-artwork/shiny/${id}.png`,
  home: (id) => `other/home/shiny/${id}.png`,
  'home-shiny': (id) => `other/home/shiny/${id}.png`,
  'dream-world': (id) => `other/official-artwork/shiny/${id}.png`,
  showdown: (id) => `other/showdown/shiny/${id}.gif`,
  sprite: (id) => `shiny/${id}.png`,
};

/** Artwork cromatico (shiny) del Pokémon, nello stile scelto quando esiste. */
export function getShinyArtworkUrl(id: number, style: ArtworkStyle = DEFAULT_ARTWORK_STYLE): string {
  return `${SPRITES_BASE_URL}/${SHINY_PATHS[style](id)}`;
}

/**
 * Pokémon il cui nome contiene `search` (anche parziale, senza maiuscole e accenti), tra
 * tutti quelli di una generazione o di tutte se `generationId` è null. Nessuna chiamata di
 * rete: trova anche i Pokémon non ancora caricati nell'elenco.
 */
export function searchPokemonIndex(search: string, generationId?: number | null): PokemonSummary[] {
  const needle = normalizeSearch(search).replace(/-/g, ' ');
  if (!needle) return [];
  const { firstId, lastId } = getPokemonRange(generationId);
  return INDEX.filter(
    (entry) => entry.id >= firstId && entry.id <= lastId && getSearchText().get(entry.id)!.includes(needle),
  ).map(toSummary);
}

/** I Pokémon con questi id (in ordine di id), di una generazione o di tutte, letti dall'indice. */
export function getPokemonSummaries(ids: Iterable<number>, generationId?: number | null): PokemonSummary[] {
  const wanted = new Set(ids);
  const { firstId, lastId } = getPokemonRange(generationId);
  return INDEX.filter((entry) => wanted.has(entry.id) && entry.id >= firstId && entry.id <= lastId).map(
    toSummary,
  );
}

const INDEX_BY_ID = new Map(INDEX.map((entry) => [entry.id, entry]));

/** Valore di una statistica base (o del totale) letto dall'indice; null per numero e nome. */
export function getIndexStat(id: number, sort: PokemonSort): number | null {
  const entry = INDEX_BY_ID.get(id);
  if (!entry || sort === 'number' || sort === 'name') return null;
  if (sort === 'total') return entry.stats.reduce((sum, value) => sum + value, 0);
  return entry.stats[STAT_NAMES.indexOf(sort)];
}

/**
 * Elenco filtrato e ordinato dall'indice, senza chiamate: generazione (null = tutte), ricerca
 * per nome, solo gli id di `ids` se passati (preferiti, shiny), tipi e categoria di `filters`.
 * Gli ex aequo restano in ordine di numero.
 */
export function queryPokemonIndex({
  search,
  generationId,
  ids,
  filters,
}: {
  search: string;
  generationId: number | null;
  ids?: ReadonlySet<number>;
  filters: PokemonFilters;
}): PokemonSummary[] {
  const needle = normalizeSearch(search).replace(/-/g, ' ');
  const { firstId, lastId } = getPokemonRange(generationId);
  const { types, category, sort, reversed } = filters;
  const entries = INDEX.filter(
    (entry) =>
      entry.id >= firstId &&
      entry.id <= lastId &&
      (!ids || ids.has(entry.id)) &&
      (!needle || getSearchText().get(entry.id)!.includes(needle)) &&
      types.every((type) => entry.types.includes(type)) &&
      (!category || entry[category]),
  );
  // Numero e nome crescenti, statistiche dalla più alta; `reversed` capovolge.
  const direction = reversed ? -1 : 1;
  if (sort === 'name') {
    const locale = getLocale();
    entries.sort(
      (a, b) => direction * pokemonName(a.id, a.name).localeCompare(pokemonName(b.id, b.name), locale),
    );
  } else if (sort !== 'number') {
    entries.sort((a, b) => direction * (getIndexStat(b.id, sort)! - getIndexStat(a.id, sort)!) || a.id - b.id);
  } else if (reversed) {
    entries.reverse();
  }
  return entries.map(toSummary);
}

function toSummary(entry: PokemonIndexEntry): PokemonSummary {
  return {
    id: entry.id,
    name: entry.name,
    generation: getGenerationOfPokemon(entry.id),
    types: entry.types.filter(isTypeName),
    artworkUrl: getArtworkUrl(entry.id),
  };
}

/** Id del Pokémon precedente e successivo tra tutte le generazioni coperte (null ai bordi). */
export function getAdjacentIds(id: number): { previous: number | null; next: number | null } {
  return {
    previous: id > FIRST_POKEMON_ID ? id - 1 : null,
    next: id < LAST_POKEMON_ID ? id + 1 : null,
  };
}

/** Ricava l'id da un URL tipo `https://pokeapi.co/api/v2/pokemon/25/`. */
export function getIdFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  if (!match) throw new Error(`URL PokéAPI senza id: ${url}`);
  return Number(match[1]);
}

export function isTypeName(value: string): value is TypeName {
  return (TYPE_NAMES as readonly string[]).includes(value);
}

export function isStatName(value: string): value is StatName {
  return STAT_NAMES.includes(value);
}

export function toPokemon(raw: PokemonResponse): Pokemon {
  return {
    id: raw.id,
    // Il nome della specie: per Deoxys (#386) `raw.name` è la forma, «deoxys-normal».
    name: raw.species.name,
    generation: getGenerationOfPokemon(raw.id),
    types: [...raw.types]
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name)
      .filter(isTypeName),
    artworkUrl: getArtworkUrl(raw.id),
    height: raw.height,
    weight: raw.weight,
    abilities: [...raw.abilities]
      .sort((a, b) => a.slot - b.slot)
      .map((a) => ({ name: a.ability.name, isHidden: a.is_hidden })),
    stats: raw.stats.flatMap((s) =>
      isStatName(s.stat.name) ? [{ name: s.stat.name, value: s.base_stat }] : [],
    ),
  };
}

export function toPokemonSpecies(raw: PokemonSpeciesResponse): PokemonSpecies {
  // L'ultima voce nella lingua in uso è quella del gioco più recente; se non c'è, in inglese.
  const description = latestLocalizedFlavor(
    raw.flavor_text_entries.map((entry) => ({ text: entry.flavor_text, language: entry.language })),
  );
  const genus = localized(raw.genera);
  return {
    id: raw.id,
    description,
    genus: genus?.genus ?? null,
    evolutionChainId: raw.evolution_chain ? getIdFromUrl(raw.evolution_chain.url) : null,
    varieties: raw.varieties.map((v) => ({
      pokemonId: getIdFromUrl(v.pokemon.url),
      name: v.pokemon.name,
      isDefault: v.is_default,
    })),
  };
}

/**
 * Riferimenti (id e nome) di una pagina dell'elenco. `offset` è l'offset di PokéAPI
 * (id - 1); la pagina non esce dalla generazione indicata, o da tutte se è null.
 */
export async function fetchPokemonPage(
  offset: number,
  signal?: AbortSignal,
  generationId?: number | null,
): Promise<{ id: number; name: string }[]> {
  const { lastId } = getPokemonRange(generationId);
  const limit = Math.min(PAGE_SIZE, lastId - offset);
  if (limit <= 0) return [];
  const data = await fetchJson<PokemonListResponse>(
    `/pokemon?limit=${limit}&offset=${offset}`,
    signal,
  );
  return data.results.map((r) => ({ id: getIdFromUrl(r.url), name: r.name }));
}

/** Dettaglio di un Pokémon per id o per nome (minuscolo, come in PokéAPI). */
export async function fetchPokemon(idOrName: number | string, signal?: AbortSignal): Promise<Pokemon> {
  const key = typeof idOrName === 'string' ? idOrName.trim().toLowerCase() : idOrName;
  const raw = await fetchJson<PokemonResponse>(`/pokemon/${key}`, signal);
  return toPokemon(raw);
}

/** Tutti i Pokémon di una generazione, in ordine di id (una chiamata per Pokémon). */
export async function fetchGenerationPokemon(
  generationId: number,
  signal?: AbortSignal,
): Promise<Pokemon[]> {
  const { firstId, lastId } = getPokemonRange(generationId);
  const ids = Array.from({ length: lastId - firstId + 1 }, (_, i) => firstId + i);
  return Promise.all(ids.map((id) => fetchPokemon(id, signal)));
}

export async function fetchPokemonSpecies(id: number, signal?: AbortSignal): Promise<PokemonSpecies> {
  const raw = await fetchJson<PokemonSpeciesResponse>(`/pokemon-species/${id}`, signal);
  return toPokemonSpecies(raw);
}

/** Converte il parametro di rotta (`"25"`) in un id coperto dal Pokédex (Gen I–IX), altrimenti null. */
export function parsePokemonId(value: string | string[] | number | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  return Number.isInteger(id) && id >= FIRST_POKEMON_ID && id <= LAST_POKEMON_ID ? id : null;
}
