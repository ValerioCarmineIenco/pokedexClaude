// Mosse che un Pokémon impara (tab «Mosse» della scheda), divise per gruppo di giochi.

/** Metodi mostrati come sezioni; «other» raccoglie i casi speciali (Pikachu Surf, Champions…). */
export type LearnMethod = 'level-up' | 'machine' | 'egg' | 'tutor' | 'other';

/** Una mossa imparata in un gruppo di giochi. Nome, tipo e potenza vengono dall'indice locale. */
export type LearnedMove = {
  moveId: number;
  method: LearnMethod;
  /** Livello per `level-up` (0 = imparata evolvendosi), altrimenti 0. */
  level: number;
};

/** Un gruppo di giochi (es. Rosso Fuoco e Verde Foglia) con le sue mosse. */
export type LearnsetVersionGroup = {
  /** Slug di PokéAPI (es. `firered-leafgreen`). */
  slug: string;
  /** Nome italiano (es. «Rosso Fuoco e Verde Foglia»). */
  label: string;
  /** Generazione del gruppo; 0 se è un gioco che l'app non conosce ancora. */
  generation: number;
  /** Colore del pallino nel selettore, quello del primo gioco del gruppo. */
  color: string;
  moves: LearnedMove[];
};

/** Mosse di un Pokémon, con i gruppi di giochi dal più recente al più vecchio. */
export type PokemonLearnset = {
  versionGroups: LearnsetVersionGroup[];
  /** Gruppo scelto all'apertura: il più recente con mosse per livello. Null se non ne ha. */
  defaultVersionGroup: string | null;
};
