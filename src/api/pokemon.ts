import { fetchJson } from '@/api/client';
import {
  FIRST_POKEMON_ID,
  getGenerationOfPokemon,
  getPokemonRange,
  LAST_POKEMON_ID,
} from '@/api/generations';
import type {
  NamedAPIResource,
  PokemonListResponse,
  PokemonResponse,
  PokemonSpeciesResponse,
} from '@/types/pokeapi';
import {
  TYPE_NAMES,
  type Pokemon,
  type PokemonSpecies,
  type StatName,
  type TypeName,
} from '@/types/pokemon';

export const PAGE_SIZE = 20;

// Per chi già importava gli estremi da qui.
export { FIRST_POKEMON_ID, LAST_POKEMON_ID };

const ARTWORK_BASE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

const STAT_NAMES: readonly string[] = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
] satisfies StatName[];

/** Artwork ufficiale, costruito dall'id senza chiamate extra. */
export function getArtworkUrl(id: number): string {
  return `${ARTWORK_BASE_URL}/${id}.png`;
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

function isTypeName(value: string): value is TypeName {
  return (TYPE_NAMES as readonly string[]).includes(value);
}

function isStatName(value: string): value is StatName {
  return STAT_NAMES.includes(value);
}

export function toPokemon(raw: PokemonResponse): Pokemon {
  return {
    id: raw.id,
    name: raw.name,
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

const isItalian = (entry: { language: NamedAPIResource }) => entry.language.name === 'it';

/** Le descrizioni arrivano con a capo e form feed dei giochi originali. */
function cleanFlavorText(text: string): string {
  return text.replace(/[\n\f\r­]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function toPokemonSpecies(raw: PokemonSpeciesResponse): PokemonSpecies {
  // L'ultima voce italiana è quella del gioco più recente.
  const flavor = raw.flavor_text_entries.filter(isItalian).at(-1);
  const genus = raw.genera.find(isItalian);
  return {
    id: raw.id,
    description: flavor ? cleanFlavorText(flavor.flavor_text) : null,
    genus: genus?.genus ?? null,
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

/** Converte il parametro di rotta (`"25"`) in un id coperto dal Pokédex (Gen 1-2), altrimenti null. */
export function parsePokemonId(value: string | string[] | number | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  return Number.isInteger(id) && id >= FIRST_POKEMON_ID && id <= LAST_POKEMON_ID ? id : null;
}
