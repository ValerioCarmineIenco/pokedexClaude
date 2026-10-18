/** Pezzo del testo di un metodo di evoluzione: semplice testo o un collegamento a un dettaglio. */
export type EvolutionTextPart =
  | { kind: 'text'; text: string }
  | { kind: 'item'; text: string; itemId: number }
  | { kind: 'location'; text: string; locationId: number };

/** Come si evolve, in italiano (es. «Livello 16», «Usa Pietratuono»), diviso in pezzi. */
export type EvolutionMethod = EvolutionTextPart[];

/** Uno stadio della catena e i Pokémon in cui si evolve. */
export type EvolutionStage = {
  /** Id nazionale della specie (coincide con l'id del Pokémon). */
  id: number;
  /** Slug di PokéAPI (es. `bulbasaur`). */
  name: string;
  /** Pokémon Baby (es. Pichu). */
  isBaby: boolean;
  /** Come ci si arriva dallo stadio precedente nei giochi recenti; vuoto per il primo stadio. */
  methods: EvolutionMethod[];
  /** Metodi diversi dei giochi precedenti (es. Leafeon vicino alla roccia di muschio). */
  legacyMethods: EvolutionMethod[];
  evolvesTo: EvolutionStage[];
};

/** Dati di `/evolution-chain/{id}`: l'albero parte dal primo stadio. */
export type EvolutionChain = {
  id: number;
  root: EvolutionStage;
  /** Numero di Pokémon nella catena (1 = non si evolve). */
  size: number;
};
