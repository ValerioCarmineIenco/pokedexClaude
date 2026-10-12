import type { ItemCategory } from '@/types/item';

export const queryKeys = {
  pokemonList: ['pokemon', 'list'] as const,
  pokemon: (id: number) => ['pokemon', 'detail', id] as const,
  pokemonSpecies: (id: number) => ['pokemon', 'species', id] as const,
  pokemonArtworks: (id: number) => ['pokemon', 'artworks', id] as const,
  itemList: (category: ItemCategory | 'all') => ['items', 'list', category] as const,
  item: (id: number) => ['items', 'detail', id] as const,
};
