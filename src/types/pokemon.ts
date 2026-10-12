// Forme pronte per la UI. Ricalcano i view model del thread UI (`src/types/ui.ts`)
// campo per campo, così gli hook si collegano alle schermate senza conversioni.

export const TYPE_NAMES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
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

/** Nome inglese del tipo, come in PokéAPI (es. `fire`). */
export type TypeName = (typeof TYPE_NAMES)[number];

export type StatName =
  | 'hp'
  | 'attack'
  | 'defense'
  | 'special-attack'
  | 'special-defense'
  | 'speed';

/** Quanto serve per una card dell'elenco. */
export type PokemonSummary = {
  id: number;
  /** Nome grezzo di PokéAPI (es. `bulbasaur`); l'iniziale maiuscola la mette la UI. */
  name: string;
  /** In ordine di slot: il primo è il tipo principale. */
  types: TypeName[];
  /** Artwork ufficiale, costruito dall'id. */
  artworkUrl: string;
};

/** Dati di `/pokemon/{id}`. */
export type Pokemon = PokemonSummary & {
  /** Decimetri, come in PokéAPI. */
  height: number;
  /** Ettogrammi, come in PokéAPI. */
  weight: number;
  /** Slug di PokéAPI (es. `solar-power`). */
  abilities: { name: string; isHidden: boolean }[];
  stats: { name: StatName; value: number }[];
};

/** Scheda completa: `/pokemon/{id}` più la descrizione di `/pokemon-species/{id}`. */
export type PokemonDetail = Pokemon & {
  /** Ultima descrizione italiana, ripulita dagli a capo; null se assente. */
  description: string | null;
};

/** Dati di `/pokemon-species/{id}`. */
export type PokemonSpecies = {
  id: number;
  description: string | null;
  /** Categoria in italiano (es. «Pokémon Seme»), null se assente. */
  genus: string | null;
};
