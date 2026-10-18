import { useMemo } from 'react';

import { searchPokemonIndex } from '@/api/pokemon';
import type { PokemonSummary } from '@/types/pokemon';
import { normalizeSearch as normalize } from '@/utils/search';

/** Filtra per nome i Pokémon passati (nessuna chiamata di rete). */
export function filterPokemonByName<T extends { name: string }>(pokemon: T[], query: string): T[] {
  const needle = normalize(query);
  if (!needle) return pokemon;
  return pokemon.filter((p) => normalize(p.name).includes(needle));
}

/**
 * Ricerca per nome tra tutti i Pokémon della generazione (o di tutte se null), anche quelli
 * non ancora caricati nell'elenco: legge l'indice statico, senza chiamate di rete.
 * Uso: `const results = usePokemonSearch(searchText, generationId);` (vuoto senza testo).
 */
export function usePokemonSearch(query: string, generationId: number | null = null): PokemonSummary[] {
  return useMemo(() => searchPokemonIndex(query, generationId), [query, generationId]);
}
