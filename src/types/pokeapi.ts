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

export type MoveResponse = {
  id: number;
  name: string;
  accuracy: number | null;
  effect_chance: number | null;
  pp: number | null;
  priority: number;
  power: number | null;
  damage_class: NamedAPIResource;
  type: NamedAPIResource;
  target: NamedAPIResource;
  generation: NamedAPIResource;
  names: { name: string; language: NamedAPIResource }[];
  flavor_text_entries: {
    flavor_text: string;
    language: NamedAPIResource;
    version_group: NamedAPIResource;
  }[];
  /** Il testo contiene il segnaposto `$effect_chance`. */
  effect_entries: { effect: string; short_effect: string; language: NamedAPIResource }[];
  /** Null per alcune mosse recenti senza dati di lotta. */
  meta: {
    ailment: NamedAPIResource;
    category: NamedAPIResource;
    min_hits: number | null;
    max_hits: number | null;
    min_turns: number | null;
    max_turns: number | null;
    drain: number;
    healing: number;
    crit_rate: number;
    ailment_chance: number;
    flinch_chance: number;
    stat_chance: number;
  } | null;
  stat_changes: { change: number; stat: NamedAPIResource }[];
  learned_by_pokemon: NamedAPIResource[];
};

export type TypeResponse = {
  id: number;
  name: string;
  /** Efficacia nell'ultima generazione (quelle passate sono in `past_damage_relations`). */
  damage_relations: {
    double_damage_to: NamedAPIResource[];
    half_damage_to: NamedAPIResource[];
    no_damage_to: NamedAPIResource[];
    double_damage_from: NamedAPIResource[];
    half_damage_from: NamedAPIResource[];
    no_damage_from: NamedAPIResource[];
  };
};
