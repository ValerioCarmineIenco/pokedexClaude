// Nature (v3). Contratto condiviso con la schermata «Nature» (solo elenco, niente dettaglio).

import type { StatName } from './pokemon';

/** Voce dell'indice incluso nell'app (`src/data/natureIndex.json`). */
export type NatureIndexEntry = {
  id: number;
  /** Slug di PokéAPI (es. `bold`). */
  name: string;
  /** Nome italiano (es. «Sicura»), altrimenti inglese: ripiego di `localName('nature', id)`. */
  label: string;
};

/** Sapore delle bacche, come in PokéAPI (`/berry-flavor`). */
export type FlavorName = 'spicy' | 'dry' | 'sweet' | 'bitter' | 'sour';

/** Statistica toccata da una natura: i PS non cambiano mai. */
export type NatureStatName = Exclude<StatName, 'hp'>;

export type NatureStat = {
  name: NatureStatName;
  /** Nome per esteso nella lingua in uso (es. «Attacco Speciale»). */
  label: string;
};

export type NatureFlavor = {
  name: FlavorName;
  /** Nome nella lingua in uso (es. «Piccante»). */
  label: string;
};

/**
 * Dati di `/nature/{id}`, pronti per l'elenco. Le nature neutre (Ardita, Docile, Ritrosa,
 * Furba, Seria) non cambiano statistiche né hanno sapori preferiti: quei campi sono null.
 */
export type Nature = {
  id: number;
  /** Nome nella lingua in uso (es. «Sicura»), altrimenti inglese. */
  name: string;
  /** Statistica aumentata del 10%. */
  increasedStat: NatureStat | null;
  /** Statistica diminuita del 10%. */
  decreasedStat: NatureStat | null;
  /** Sapore preferito. */
  likedFlavor: NatureFlavor | null;
  /** Sapore non gradito. */
  dislikedFlavor: NatureFlavor | null;
  /** True per le nature neutre. */
  isNeutral: boolean;
};
