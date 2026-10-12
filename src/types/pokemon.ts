// Tipi già pronti per la UI, ricavati dalle risposte di PokéAPI.

export const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'grass',
  'electric',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;

/** Chiave inglese del tipo, come in PokéAPI (es. `fire`). */
export type PokemonType = (typeof POKEMON_TYPES)[number];

export type StatKey =
  | 'hp'
  | 'attack'
  | 'defense'
  | 'special-attack'
  | 'special-defense'
  | 'speed';

export type PokemonStat = {
  key: StatKey;
  /** Etichetta italiana (es. «Attacco»). */
  label: string;
  value: number;
};

/** Dati di `/pokemon/{id}`: bastano per la card dell'elenco e per il dettaglio. */
export type Pokemon = {
  id: number;
  /** Nome come in PokéAPI, con l'iniziale maiuscola (es. «Bulbasaur»). */
  name: string;
  /** In ordine di slot: il primo è il tipo principale. */
  types: PokemonType[];
  heightM: number;
  weightKg: number;
  /** Nomi delle abilità leggibili (es. «Solar Power»). */
  abilities: string[];
  stats: PokemonStat[];
  /** Artwork ufficiale, costruito dall'id. */
  imageUrl: string;
};

/** Dati di `/pokemon-species/{id}` usati nel dettaglio. */
export type PokemonSpecies = {
  id: number;
  /** Ultima descrizione italiana disponibile, ripulita dagli a capo; null se assente. */
  description: string | null;
  /** Categoria in italiano se presente (es. «Pokémon Seme»). */
  genus: string | null;
};
