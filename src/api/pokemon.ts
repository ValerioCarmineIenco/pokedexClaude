import { fetchJson } from '@/api/client';
import type {
  NamedAPIResource,
  PokemonListResponse,
  PokemonResponse,
  PokemonSpeciesResponse,
} from '@/types/pokeapi';
import {
  POKEMON_TYPES,
  type Pokemon,
  type PokemonSpecies,
  type PokemonStat,
  type PokemonType,
  type StatKey,
} from '@/types/pokemon';
import { capitalize, formatSlug } from '@/utils/format';

/** La v1 copre solo la prima generazione. */
export const FIRST_POKEMON_ID = 1;
export const LAST_POKEMON_ID = 151;
export const PAGE_SIZE = 20;

const ARTWORK_BASE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

const STAT_LABELS: Record<StatKey, string> = {
  hp: 'PS',
  attack: 'Attacco',
  defense: 'Difesa',
  'special-attack': 'Att. Sp.',
  'special-defense': 'Dif. Sp.',
  speed: 'Velocità',
};

/** Artwork ufficiale, costruito dall'id senza chiamate extra. */
export function getArtworkUrl(id: number): string {
  return `${ARTWORK_BASE_URL}/${id}.png`;
}

/** Id del Pokémon precedente e successivo dentro la Gen 1 (null ai bordi). */
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

function isPokemonType(value: string): value is PokemonType {
  return (POKEMON_TYPES as readonly string[]).includes(value);
}

function isStatKey(value: string): value is StatKey {
  return value in STAT_LABELS;
}

export function toPokemon(raw: PokemonResponse): Pokemon {
  return {
    id: raw.id,
    name: capitalize(raw.name),
    types: [...raw.types]
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name)
      .filter(isPokemonType),
    heightM: raw.height / 10,
    weightKg: raw.weight / 10,
    abilities: [...raw.abilities]
      .sort((a, b) => a.slot - b.slot)
      .map((a) => formatSlug(a.ability.name)),
    stats: raw.stats
      .filter((s) => isStatKey(s.stat.name))
      .map(
        (s): PokemonStat => ({
          key: s.stat.name as StatKey,
          label: STAT_LABELS[s.stat.name as StatKey],
          value: s.base_stat,
        }),
      ),
    imageUrl: getArtworkUrl(raw.id),
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

/** Riferimenti (id e nome) di una pagina dell'elenco, senza uscire dalla Gen 1. */
export async function fetchPokemonPage(
  offset: number,
  signal?: AbortSignal,
): Promise<{ id: number; name: string }[]> {
  const limit = Math.min(PAGE_SIZE, LAST_POKEMON_ID - offset);
  if (limit <= 0) return [];
  const data = await fetchJson<PokemonListResponse>(
    `/pokemon?limit=${limit}&offset=${offset}`,
    signal,
  );
  return data.results.map((r) => ({ id: getIdFromUrl(r.url), name: capitalize(r.name) }));
}

/** Dettaglio di un Pokémon per id o per nome (minuscolo, come in PokéAPI). */
export async function fetchPokemon(idOrName: number | string, signal?: AbortSignal): Promise<Pokemon> {
  const key = typeof idOrName === 'string' ? idOrName.trim().toLowerCase() : idOrName;
  const raw = await fetchJson<PokemonResponse>(`/pokemon/${key}`, signal);
  return toPokemon(raw);
}

export async function fetchPokemonSpecies(id: number, signal?: AbortSignal): Promise<PokemonSpecies> {
  const raw = await fetchJson<PokemonSpeciesResponse>(`/pokemon-species/${id}`, signal);
  return toPokemonSpecies(raw);
}

/** Converte il parametro di rotta (`"25"`) in un id valido della Gen 1, altrimenti null. */
export function parsePokemonId(value: string | string[] | number | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  return Number.isInteger(id) && id >= FIRST_POKEMON_ID && id <= LAST_POKEMON_ID ? id : null;
}
