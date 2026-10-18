// Abilità (v3). Contratto condiviso con le schermate «Abilità».

/** Voce dell'indice incluso nell'app (`src/data/abilityIndex.json`). */
export type AbilityIndexEntry = {
  id: number;
  /** Slug di PokéAPI (es. `overgrow`). */
  name: string;
  /** Nome italiano (es. «Erbaiuto»), altrimenti inglese: ripiego di `localName('ability', id)`. */
  label: string;
  /** Generazione in cui è stata introdotta (3 = Rubino e Zaffiro). */
  generation: number;
  /** Id nazionali di tutti i Pokémon che la possiedono, in ordine (anche fuori dal Pokédex). */
  pokemonIds: number[];
};

/** Un Pokémon che possiede l'abilità, già nel Pokédex dell'app. */
export type AbilityPokemon = {
  id: number;
  /** Nome grezzo di PokéAPI (es. `bulbasaur`); l'iniziale maiuscola la mette la UI. */
  name: string;
  /** Abilità nascosta per questo Pokémon. */
  isHidden: boolean;
  /** Artwork ufficiale, costruito dall'id. */
  artworkUrl: string;
};

/** Dati di `/ability/{id}`, pronti per lista e dettaglio. */
export type Ability = {
  id: number;
  /** Nome nella lingua in uso (es. «Erbaiuto»), altrimenti inglese. */
  name: string;
  /** Ultima descrizione dei giochi nella lingua in uso, altrimenti inglese; stringa vuota se assente. */
  description: string;
  /**
   * Effetto in lotta spiegato per esteso, nella lingua in uso se PokéAPI lo ha (di solito solo
   * inglese e tedesco), altrimenti in inglese; null se assente.
   */
  effect: string | null;
  /** Lingua PokéAPI di `effect` (es. `en`), per avvisare quando non è quella in uso; null senza effetto. */
  effectLanguage: string | null;
  /** Generazione in cui è stata introdotta. */
  generation: number;
  /** Pokémon del Pokédex che la possiedono, in ordine di id. Può essere vuota. */
  pokemon: AbilityPokemon[];
};

/** Una pagina di `getAbilities`. */
export type AbilityPage = {
  abilities: Ability[];
  /** Pagina successiva, null se è l'ultima. */
  nextPage: number | null;
  /** Abilità totali dell'elenco (della ricerca, se filtrato). */
  total: number;
};
