import type { ItemCategory } from '@/types/item';
import type { TypeName } from '@/types/pokemon';
import { getLanguage } from '@/i18n';

/**
 * L'ultimo elemento è la lingua: nomi e descrizioni dei dati arrivano già tradotti, quindi ogni
 * lingua ha la sua cache. Le schermate si rimontano quando cambia (vedi `LanguageGate`).
 */
export const queryKeys = {
  /** `null` = tutte le generazioni in sequenza. */
  pokemonList: (generationId: number | null = null) => ['pokemon', 'list', generationId, getLanguage()] as const,
  pokemon: (id: number) => ['pokemon', 'detail', id, getLanguage()] as const,
  pokemonSpecies: (id: number) => ['pokemon', 'species', id, getLanguage()] as const,
  pokemonArtworks: (id: number) => ['pokemon', 'artworks', id, getLanguage()] as const,
  /** Catena evolutiva vista dalla scheda della specie `speciesId`. */
  evolutionChain: (speciesId: number) => ['pokemon', 'evolutions', speciesId, getLanguage()] as const,
  /** Forme alternative della specie (Mega, regionali, Gigamax…). */
  pokemonForms: (speciesId: number) => ['pokemon', 'forms', speciesId, getLanguage()] as const,
  pokemonLearnset: (id: number) => ['pokemon', 'learnset', id, getLanguage()] as const,
  pokemonEncounters: (id: number) => ['pokemon', 'encounters', id, getLanguage()] as const,
  /**
   * `search` già normalizzata (vedi `normalizeSearch`); stringa vuota = nessuna ricerca.
   * `listByCategory`: l'elenco completo ora è ordinato per categoria, le pagine salvate prima no.
   * La categoria resta in posizione 2 (la legge `placeholderData` di `useItems`).
   */
  itemList: (category: ItemCategory | 'all', search = '') =>
    ['items', 'listByCategory', category, search, getLanguage()] as const,
  item: (id: number) => ['items', 'detail', id, getLanguage()] as const,
  /** `search` già normalizzata (vedi `normalizeSearch`); stringa vuota = nessuna ricerca. */
  abilityList: (search = '') => ['abilities', 'list', search, getLanguage()] as const,
  ability: (id: number) => ['abilities', 'detail', id, getLanguage()] as const,
  /** Tutte le 25 nature: la ricerca filtra in locale, senza chiavi separate. */
  natures: () => ['natures', 'list', getLanguage()] as const,
  /** L'elenco delle mosse viene dall'indice locale: serve solo il dettaglio. */
  move: (id: number) => ['moves', 'detail', id, getLanguage()] as const,
  /** L'elenco delle località viene dall'indice locale: serve solo il dettaglio. */
  location: (id: number) => ['locations', 'detail', id, getLanguage()] as const,
  typeMatchups: (type: TypeName) => ['types', 'matchups', type, getLanguage()] as const,
};
