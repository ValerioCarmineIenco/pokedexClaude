import { fetchJson } from '@/api/client';
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

/** La v1 copre solo la prima generazione. */
export const FIRST_POKEMON_ID = 1;
export const LAST_POKEMON_ID = 151;
export const PAGE_SIZE = 20;

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
 * senza chiamate extra; tutti esistono per i 151 Pokémon della Gen 1.
 */
export const ARTWORK_STYLES = [
  {
    id: 'official',
    label: 'Artwork ufficiale',
    description: 'Illustrazione ufficiale ad alta risoluzione',
    path: (id: number) => `other/official-artwork/${id}.png`,
  },
  {
    id: 'official-shiny',
    label: 'Artwork ufficiale shiny',
    description: "L'illustrazione ufficiale nei colori shiny",
    path: (id: number) => `other/official-artwork/shiny/${id}.png`,
  },
  {
    id: 'home',
    label: 'Pokémon HOME',
    description: 'Modelli 3D di Pokémon HOME',
    path: (id: number) => `other/home/${id}.png`,
  },
  {
    id: 'home-shiny',
    label: 'Pokémon HOME shiny',
    description: 'Modelli 3D di Pokémon HOME nei colori shiny',
    path: (id: number) => `other/home/shiny/${id}.png`,
  },
  {
    id: 'dream-world',
    label: 'Dream World',
    description: 'Disegni vettoriali di Dream World',
    path: (id: number) => `other/dream-world/${id}.svg`,
  },
  {
    id: 'showdown',
    label: 'Showdown animato',
    description: 'Sprite animati di Pokémon Showdown',
    path: (id: number) => `other/showdown/${id}.gif`,
  },
  {
    id: 'sprite',
    label: 'Sprite pixel',
    description: 'Lo sprite in pixel art dei giochi',
    path: (id: number) => `${id}.png`,
  },
] as const;

export type ArtworkStyle = (typeof ARTWORK_STYLES)[number]['id'];

export const DEFAULT_ARTWORK_STYLE: ArtworkStyle = 'official';

export function isArtworkStyle(value: unknown): value is ArtworkStyle {
  return ARTWORK_STYLES.some((style) => style.id === value);
}

/** Artwork del Pokémon nello stile scelto (predefinito: artwork ufficiale). */
export function getArtworkUrl(id: number, style: ArtworkStyle = DEFAULT_ARTWORK_STYLE): string {
  const entry = ARTWORK_STYLES.find((s) => s.id === style) ?? ARTWORK_STYLES[0];
  return `${SPRITES_BASE_URL}/${entry.path(id)}`;
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
  return data.results.map((r) => ({ id: getIdFromUrl(r.url), name: r.name }));
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
