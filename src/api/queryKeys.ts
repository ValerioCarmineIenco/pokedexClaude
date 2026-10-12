import type { ItemCategory } from '@/types/item';

export const queryKeys = {
  /** `null` = tutte le generazioni in sequenza. */
  pokemonList: (generationId: number | null = null) => ['pokemon', 'list', generationId] as const,
  pokemon: (id: number) => ['pokemon', 'detail', id] as const,
  pokemonSpecies: (id: number) => ['pokemon', 'species', id] as const,
  pokemonArtworks: (id: number) => ['pokemon', 'artworks', id] as const,
  /** `search` già normalizzata (vedi `normalizeSearch`); stringa vuota = nessuna ricerca. */
  itemList: (category: ItemCategory | 'all', search = '') =>
    ['items', 'list', category, search] as const,
  item: (id: number) => ['items', 'detail', id] as const,
};
