// Forma grezza delle risposte di PokéAPI v2 (solo i campi che usiamo).
// Docs: https://pokeapi.co/docs/v2

export type NamedAPIResource = {
  name: string;
  url: string;
};

export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
};

export type PokemonResponse = {
  id: number;
  /** Nome della forma (es. `deoxys-normal`): per il nome mostrato si usa `species.name`. */
  name: string;
  species: NamedAPIResource;
  height: number; // decimetri
  weight: number; // ettogrammi
  types: { slot: number; type: NamedAPIResource }[];
  abilities: { is_hidden: boolean; slot: number; ability: NamedAPIResource }[];
  stats: { base_stat: number; effort: number; stat: NamedAPIResource }[];
  sprites: SpriteTree;
};

/**
 * Oggetto `sprites`: URL (o null) e gruppi annidati per fonte, generazione e gioco
 * (es. `other.home.front_shiny`, `versions.generation-i.yellow.back_gray`).
 */
export type SpriteTree = {
  [key: string]: string | null | SpriteTree;
};

export type PokemonSpeciesResponse = {
  id: number;
  name: string;
  names: { name: string; language: NamedAPIResource }[];
  flavor_text_entries: {
    flavor_text: string;
    language: NamedAPIResource;
    version: NamedAPIResource;
  }[];
  genera: { genus: string; language: NamedAPIResource }[];
};

export type ItemResponse = {
  id: number;
  name: string;
  category: NamedAPIResource;
  names: { name: string; language: NamedAPIResource }[];
  flavor_text_entries: {
    text: string;
    language: NamedAPIResource;
    version_group: NamedAPIResource;
  }[];
  effect_entries: { effect: string; short_effect: string; language: NamedAPIResource }[];
  sprites: { default: string | null };
};

export type AbilityResponse = {
  id: number;
  name: string;
  is_main_series: boolean;
  generation: NamedAPIResource;
  names: { name: string; language: NamedAPIResource }[];
  flavor_text_entries: {
    flavor_text: string;
    language: NamedAPIResource;
    version_group: NamedAPIResource;
  }[];
  effect_entries: { effect: string; short_effect: string; language: NamedAPIResource }[];
  pokemon: { is_hidden: boolean; slot: number; pokemon: NamedAPIResource }[];
};

export type NatureResponse = {
  id: number;
  name: string;
  /** Null per le nature neutre. */
  increased_stat: NamedAPIResource | null;
  decreased_stat: NamedAPIResource | null;
  likes_flavor: NamedAPIResource | null;
  hates_flavor: NamedAPIResource | null;
  names: { name: string; language: NamedAPIResource }[];
};
