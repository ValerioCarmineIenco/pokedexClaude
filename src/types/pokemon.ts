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

/** Una generazione del Pokédex (es. Generazione I, id 1-151). */
export type Generation = {
  /** 1, 2, ... */
  id: number;
  /** «Generazione I» */
  name: string;
  /** Regione in italiano (es. «Kanto»). */
  region: string;
  /** Primo e ultimo id nazionale, inclusi. */
  firstId: number;
  lastId: number;
};

/** Quanto serve per una card dell'elenco. */
export type PokemonSummary = {
  id: number;
  /** Generazione di appartenenza (1, 2), ricavata dall'id. */
  generation: number;
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

/** Un'immagine della galleria artwork. */
export type ArtworkImage = {
  /** Percorso nell'oggetto `sprites` (es. `other/home/front_shiny`), unico per Pokémon. */
  key: string;
  /** Etichetta italiana della variante (es. «Retro shiny»). */
  label: string;
  url: string;
};

/** Immagini della stessa fonte o dello stesso gioco. */
export type ArtworkGroup = {
  id: string;
  title: string;
  images: ArtworkImage[];
};

/** Sprite dei giochi di una generazione. */
export type ArtworkGeneration = {
  id: string;
  /** «Generazione I» */
  title: string;
  games: ArtworkGroup[];
  imageCount: number;
};

/** Tutte le immagini di `sprites` di `/pokemon/{id}`, senza i valori null. */
export type PokemonArtworks = {
  id: number;
  /** Artwork ufficiale, HOME, Dream World, Showdown e sprite base. */
  featured: ArtworkGroup[];
  /** Sprite per generazione e gioco, dalla I in avanti. */
  generations: ArtworkGeneration[];
  imageCount: number;
};
