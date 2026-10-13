// Mosse (v3). Contratto condiviso con le schermate «Mosse» (elenco e dettaglio).

import type { StatName, TypeName } from './pokemon';

/** Classe di danno, come in PokéAPI (`/move-damage-class`). */
export type MoveDamageClass = 'physical' | 'special' | 'status';

/** Voce dell'indice incluso nell'app (`src/data/moveIndex.json`). */
export type MoveIndexEntry = {
  id: number;
  /** Slug di PokéAPI (es. `thunderbolt`). */
  name: string;
  /** Nome mostrato (es. «Fulmine»): italiano, altrimenti inglese. Serve per la ricerca. */
  label: string;
  type: TypeName;
  damageClass: MoveDamageClass;
  /** Null per le mosse senza potenza fissa (di stato, o calcolata come Colpo Basso). */
  power: number | null;
  /** Null per le mosse che non mancano mai il bersaglio. */
  accuracy: number | null;
  pp: number;
  /** Generazione in cui è stata introdotta. */
  generation: number;
  /** Id nazionale più basso tra i Pokémon che la imparano: decide se è nel Pokédex dell'app. */
  firstPokemonId: number;
};

/** Una mossa nell'elenco: tutto dall'indice locale, senza chiamate. */
export type MoveSummary = {
  id: number;
  /** Nome italiano (es. «Fulmine»), altrimenti inglese. */
  name: string;
  /** Tipo della mossa: dà il colore dello sfondo della scheda. */
  type: TypeName;
  damageClass: MoveDamageClass;
  /** Nome italiano della classe (es. «Speciale»). */
  damageClassLabel: string;
  /** Null = «—» (nessuna potenza fissa). */
  power: number | null;
  /** In percentuale; null = «—» (non manca mai). */
  accuracy: number | null;
  pp: number;
  generation: number;
};

/** Variazione di una statistica causata dalla mossa (es. Danzaspada: Attacco +2). */
export type MoveStatChange = {
  stat: Exclude<StatName, 'hp'> | 'accuracy' | 'evasion';
  /** Nome per esteso (es. «Attacco Speciale», «Elusione»). */
  label: string;
  /** Livelli, con segno: +2, -1… */
  change: number;
};

/** Un Pokémon che impara la mossa, già nel Pokédex dell'app. */
export type MovePokemon = {
  id: number;
  /** Nome grezzo di PokéAPI (es. `pikachu`); l'iniziale maiuscola la mette la UI. */
  name: string;
  /** Artwork ufficiale, costruito dall'id. */
  artworkUrl: string;
};

/** Dati di `/move/{id}`, pronti per il dettaglio. Estende la voce dell'elenco. */
export type Move = MoveSummary & {
  /** Ultima descrizione italiana dei giochi, altrimenti inglese; stringa vuota se assente. */
  description: string;
  /**
   * Effetto in lotta spiegato per esteso, con la probabilità già inserita («10% di…» resta in
   * inglese: PokéAPI non ha l'italiano). Null se assente.
   */
  effect: string | null;
  /** Versione breve di `effect`, null se assente. */
  shortEffect: string | null;
  /** Probabilità (%) dell'effetto secondario, null se non ne ha. */
  effectChance: number | null;
  /** Priorità: 0 normale, positiva agisce prima (Attacco Rapido +1), negativa dopo. */
  priority: number;
  /** Slug del bersaglio di PokéAPI (es. `selected-pokemon`). */
  target: string;
  /** Bersaglio in italiano (es. «Un Pokémon a scelta»). */
  targetLabel: string;
  /** Stato alterato che può causare (es. «Paralisi»), null se nessuno. */
  ailment: string | null;
  /** Probabilità (%) dello stato alterato; 0 = sicuro o nessuno. */
  ailmentChance: number;
  /** Probabilità (%) di far tentennare. */
  flinchChance: number;
  /** Livelli extra di brutto colpo (0 = normale). */
  critRate: number;
  /** Colpi per turno, null se colpisce una volta sola. */
  hits: { min: number; max: number } | null;
  /** Turni di durata dell'effetto, null se non dura più turni. */
  turns: { min: number; max: number } | null;
  /** % del danno recuperata (positiva) o subita come contraccolpo (negativa); 0 = nessuna. */
  drain: number;
  /** % dei PS massimi curati (positiva) o persi (negativa); 0 = nessuna. */
  healing: number;
  /** Variazioni alle statistiche, vuota se nessuna. */
  statChanges: MoveStatChange[];
  /** Probabilità (%) delle variazioni; 0 = sicure. */
  statChance: number;
  /** Pokémon del Pokédex che la imparano, in ordine di id. Può essere vuota. */
  pokemon: MovePokemon[];
};

/** Un tipo in una relazione di danno, con il nome italiano già pronto. */
export type MatchupType = {
  type: TypeName;
  /** Nome italiano (es. «Acqua»). */
  label: string;
};

/**
 * Efficacia di un tipo, da `/type/{nome}` di PokéAPI. Ogni elenco è in ordine di tipo
 * (come `TYPE_NAMES`) e può essere vuoto.
 */
export type TypeMatchups = {
  type: TypeName;
  /** Quando una mossa di questo tipo attacca. È la parte che conta per le mosse. */
  attack: {
    /** Danno ×2. */
    superEffective: MatchupType[];
    /** Danno ×½. */
    notVeryEffective: MatchupType[];
    /** Danno ×0: il bersaglio è immune. */
    noEffect: MatchupType[];
    /** Danno ×1: tutti gli altri tipi. */
    normal: MatchupType[];
  };
  /** Quando un Pokémon di questo tipo viene colpito (debolezze e resistenze del tipo). */
  defense: {
    /** Subisce ×2. */
    weakTo: MatchupType[];
    /** Subisce ×½. */
    resists: MatchupType[];
    /** Subisce ×0. */
    immuneTo: MatchupType[];
  };
};
