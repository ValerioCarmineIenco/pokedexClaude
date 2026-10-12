export const queryKeys = {
  pokemonList: ['pokemon', 'list'] as const,
  pokemon: (id: number) => ['pokemon', 'detail', id] as const,
  pokemonSpecies: (id: number) => ['pokemon', 'species', id] as const,
};
