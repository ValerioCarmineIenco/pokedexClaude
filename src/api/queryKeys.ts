export const queryKeys = {
  /** `null` = tutte le generazioni in sequenza. */
  pokemonList: (generationId: number | null = null) => ['pokemon', 'list', generationId] as const,
  pokemon: (id: number) => ['pokemon', 'detail', id] as const,
  pokemonSpecies: (id: number) => ['pokemon', 'species', id] as const,
  pokemonArtworks: (id: number) => ['pokemon', 'artworks', id] as const,
};
