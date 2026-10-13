import type { ItemCategory } from '@/types/item';
import type { TypeName } from '@/types/pokemon';

export const queryKeys = {
  /** `null` = tutte le generazioni in sequenza. */
  pokemonList: (generationId: number | null = null) => ['pokemon', 'list', generationId] as const,
  pokemon: (id: number) => ['pokemon', 'detail', id] as const,
  pokemonSpecies: (id: number) => ['pokemon', 'species', id] as const,
  pokemonArtworks: (id: number) => ['pokemon', 'artworks', id] as const,
  /**
   * `search` già normalizzata (vedi `normalizeSearch`); stringa vuota = nessuna ricerca.
   * `listByCategory`: l'elenco completo ora è ordinato per categoria, le pagine salvate prima no.
   * La categoria resta in posizione 2 (la legge `placeholderData` di `useItems`).
   */
  itemList: (category: ItemCategory | 'all', search = '') =>
    ['items', 'listByCategory', category, search] as const,
  item: (id: number) => ['items', 'detail', id] as const,
  /** `search` già normalizzata (vedi `normalizeSearch`); stringa vuota = nessuna ricerca. */
  abilityList: (search = '') => ['abilities', 'list', search] as const,
  ability: (id: number) => ['abilities', 'detail', id] as const,
  /** Tutte le 25 nature: la ricerca filtra in locale, senza chiavi separate. */
  natures: () => ['natures', 'list'] as const,
  /** L'elenco delle mosse viene dall'indice locale: serve solo il dettaglio. */
  move: (id: number) => ['moves', 'detail', id] as const,
  typeMatchups: (type: TypeName) => ['types', 'matchups', type] as const,
};
