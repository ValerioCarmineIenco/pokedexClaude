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
  moves: PokemonMoveResponse[];
};

/** Una mossa di `pokemon.moves`, con come e dove si impara in ogni gruppo di giochi. */
export type PokemonMoveResponse = {
  move: NamedAPIResource;
  version_group_details: {
    /** 0 per i metodi diversi dal livello (e per le mosse imparate evolvendosi). */
    level_learned_at: number;
    move_learn_method: NamedAPIResource;
    version_group: NamedAPIResource;
    /** Ordine tra le mosse dello stesso livello; null se non conta. */
    order: number | null;
  }[];
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
  evolution_chain: { url: string } | null;
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

export type LocationResponse = {
  id: number;
  name: string;
  /** Null per poche località senza regione. */
  region: NamedAPIResource | null;
  names: { name: string; language: NamedAPIResource }[];
  areas: NamedAPIResource[];
};

export type EncounterDetailResponse = {
  min_level: number;
  max_level: number;
  /** Probabilità della singola voce, in percentuale (0 se non nota). */
  chance: number;
  method: NamedAPIResource;
  condition_values: NamedAPIResource[];
};

export type LocationAreaResponse = {
  id: number;
  name: string;
  names: { name: string; language: NamedAPIResource }[];
  location: NamedAPIResource;
  pokemon_encounters: {
    pokemon: NamedAPIResource;
    version_details: {
      version: NamedAPIResource;
      max_chance: number;
      encounter_details: EncounterDetailResponse[];
    }[];
  }[];
};

/** Un passaggio della catena: la specie, come ci si arriva e in cosa si evolve. */
export type ChainLinkResponse = {
  is_baby: boolean;
  species: NamedAPIResource;
  /** Una voce per gioco o per variante del metodo; vuoto per il primo stadio. */
  evolution_details: EvolutionDetailResponse[];
  evolves_to: ChainLinkResponse[];
};

export type EvolutionDetailResponse = {
  trigger: NamedAPIResource;
  /** Il metodo attuale (più voci per le forme regionali); assente nei dati vecchi. */
  is_default?: boolean;
  version_group?: NamedAPIResource | null;
  region?: NamedAPIResource | null;
  evolved_pokemon_form?: NamedAPIResource | null;
  item: NamedAPIResource | null;
  held_item: NamedAPIResource | null;
  known_move: NamedAPIResource | null;
  known_move_type: NamedAPIResource | null;
  location: NamedAPIResource | null;
  /** 1 femmina, 2 maschio. */
  gender: number | null;
  min_level: number | null;
  min_happiness: number | null;
  min_beauty: number | null;
  min_affection: number | null;
  near_special_rock?: boolean;
  needs_multiplayer?: boolean;
  needs_overworld_rain: boolean;
  party_species: NamedAPIResource | null;
  party_type: NamedAPIResource | null;
  /** 1 Attacco > Difesa, -1 Attacco < Difesa, 0 uguali. */
  relative_physical_stats: number | null;
  /** `day`, `night`, `dusk`, `full-moon` o stringa vuota. */
  time_of_day: string;
  trade_species: NamedAPIResource | null;
  turn_upside_down: boolean;
  used_move?: NamedAPIResource | null;
  min_move_count?: number | null;
  min_steps?: number | null;
  min_damage_taken?: number | null;
  allowed_natures?: NamedAPIResource[] | null;
  condition_expression?: { percentage_chance?: number | null } | null;
};

export type EvolutionChainResponse = {
  id: number;
  chain: ChainLinkResponse;
};
