// Località (v3). Contratto condiviso con le schermate «Località» (elenco e dettaglio).

/** Voce dell'indice incluso nell'app (`src/data/locationIndex.json`). */
export type LocationIndexEntry = {
  id: number;
  /** Slug di PokéAPI (es. `ambrette-town`). */
  name: string;
  /** Nome mostrato: italiano se PokéAPI lo ha (es. «Petroglifari»), altrimenti inglese. */
  label: string;
  /** Nome inglese, solo se diverso da `label` (es. «Ambrette Town»). */
  englishLabel?: string;
  /** Slug della regione (es. `kalos`), null se PokéAPI non la indica. */
  region: string | null;
  /** Id dei Pokémon che vi si incontrano, forme comprese (id da 10001), senza ripetizioni. */
  pokemonIds: number[];
  /** Id dei giochi (`/version`) in cui vi si incontra almeno un Pokémon. */
  versionIds: number[];
};

/** Regione, come in PokéAPI (`/region`). */
export type LocationRegion = {
  id: number;
  /** Slug (es. `unova`). */
  name: string;
  /** Nome nella lingua in uso (es. «Unima»). */
  label: string;
};

/** Un gioco (`/version`), per esempio Rosso Fuoco o X. */
export type GameVersion = {
  id: number;
  /** Slug (es. `firered`). */
  name: string;
  /** Nome nella lingua in uso (es. «Rosso Fuoco»). */
  label: string;
  /** Generazione del gioco. */
  generation: number;
};

/** Località nell'elenco: tutto viene dall'indice locale, senza chiamate di rete. */
export type LocationSummary = {
  id: number;
  /** Slug di PokéAPI. */
  slug: string;
  /** Nome mostrato, nella lingua in uso (altrimenti inglese). */
  name: string;
  /** Nome inglese (per la ricerca). */
  englishName: string;
  region: LocationRegion | null;
  /** Pokémon diversi incontrabili (le forme regionali contano a parte). */
  pokemonCount: number;
  /** Giochi in cui vi si incontra almeno un Pokémon. */
  gameCount: number;
  /** Quei giochi, in ordine di uscita. */
  versions: GameVersion[];
};

/** Regione con le sue località, per un elenco a sezioni. */
export type LocationSection = {
  region: LocationRegion | null;
  locations: LocationSummary[];
};

/** Metodo d'incontro (`/encounter-method`): erba alta, Surf, regalo, scambio… */
export type EncounterMethod = {
  /** Slug (es. `rock-smash`). */
  name: string;
  /** Nome breve nella lingua in uso (es. «Spaccaroccia»). */
  label: string;
  /** Spiegazione in una riga (es. «Usa Spaccaroccia sulle rocce fragili»). */
  description: string;
};

/** Condizione che deve valere perché l'incontro avvenga (ora, stagione, sciame…). */
export type EncounterCondition = {
  /** Slug del valore (es. `time-night`). */
  name: string;
  /** Slug della condizione a cui appartiene (es. `time`). */
  condition: string;
  /** Testo da mostrare nella lingua in uso (tradotto o di PokéAPI), altrimenti inglese. */
  label: string;
  /**
   * Il caso «normale» (nessuno sciame, radio spenta, nessun oggetto…): la UI può nasconderlo.
   */
  isDefault: boolean;
};

export type EncounterPokemon = {
  /** Id di `/pokemon`: le forme regionali hanno id da 10001. */
  id: number;
  /** Nome grezzo di PokéAPI (es. `sandshrew-alola`). */
  name: string;
  /** Nome da mostrare: quello della specie nella lingua in uso, lo slug leggibile per le forme. */
  label: string;
  /** Artwork ufficiale, costruito dall'id. */
  artworkUrl: string;
  /** Il Pokémon ha una scheda nel Pokédex dell'app (si può aprire `/pokemon/{id}`). */
  inPokedex: boolean;
};

/**
 * Un Pokémon incontrabile con un certo metodo e certe condizioni. I giochi con gli stessi
 * livelli e la stessa probabilità sono raccolti in `versions`; se due giochi differiscono,
 * lo stesso Pokémon compare in più voci.
 */
export type LocationEncounter = {
  pokemon: EncounterPokemon;
  minLevel: number;
  maxLevel: number;
  /** Probabilità totale in percentuale (1–100), null se PokéAPI non la indica. */
  chance: number | null;
  /** Condizioni richieste; vuoto se l'incontro avviene sempre. */
  conditions: EncounterCondition[];
  versions: GameVersion[];
};

/** Incontri di un'area con lo stesso metodo, ordinati per nome del Pokémon. */
export type EncounterMethodGroup = {
  method: EncounterMethod;
  encounters: LocationEncounter[];
};

/** Zona di una località (es. «Piano 1», «Prize Corner»). */
export type LocationArea = {
  id: number;
  /** Slug di PokéAPI. */
  slug: string;
  /** Nome breve nella lingua in uso, senza il nome della località; «Principale» per l'area senza nome proprio. */
  name: string;
  /** Gruppi per metodo, nell'ordine di PokéAPI (erba alta prima, poi pesca, Surf…). */
  methods: EncounterMethodGroup[];
};

/** Dati di `/location/{id}` e delle sue aree, pronti per il dettaglio. */
export type LocationDetail = LocationSummary & {
  /** Solo le aree con almeno un incontro. */
  areas: LocationArea[];
};

/** Località in cui si incontra un Pokémon, con i metodi d'incontro (scheda Pokémon). */
export type PokemonEncounterLocation = {
  /** Id dell'indice: apre `/locations/{id}`. */
  id: number;
  /** Nome mostrato, nella lingua in uso (altrimenti inglese). */
  name: string;
  /** Metodi d'incontro in quella località, senza ripetizioni (es. «Erba alta e grotte»). */
  methods: EncounterMethod[];
};

/**
 * «Dove trovarlo»: i giochi con le stesse località sono raccolti in un solo gruppo
 * (es. Rossa e Blu), in ordine di uscita.
 */
export type PokemonEncounterGroup = {
  versions: GameVersion[];
  /** In ordine alfabetico. */
  locations: PokemonEncounterLocation[];
};
