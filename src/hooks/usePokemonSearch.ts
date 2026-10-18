import { useMemo } from 'react';

import { searchPokemonIndex } from '@/api/pokemon';
import { pokemonName } from '@/i18n/names';
import type { PokemonSummary } from '@/types/pokemon';
import { normalizeSearch as normalize } from '@/utils/search';

/**
 * Filtra per nome i Pokémon passati (nessuna chiamata di rete): con l'id cerca anche il nome
 * nella lingua in uso, oltre allo slug inglese.
 */
export function filterPokemonByName<T extends { id?: number; name: string }>(pokemon: T[], query: string): T[] {
  const needle = normalize(query);
  if (!needle) return pokemon;
  return pokemon.filter((p) => {
    const slug = p.name.replace(/-/g, ' ');
    const text = p.id == null ? slug : `${pokemonName(p.id, p.name)} ${slug}`;
    return normalize(text).includes(needle);
  });
}

/**
 * Ricerca per nome tra tutti i Pokémon della generazione (o di tutte se null), anche quelli
 * non ancora caricati nell'elenco: legge l'indice statico, senza chiamate di rete.
 * Uso: `const results = usePokemonSearch(searchText, generationId);` (vuoto senza testo).
 */
export function usePokemonSearch(query: string, generationId: number | null = null): PokemonSummary[] {
  return useMemo(() => searchPokemonIndex(query, generationId), [query, generationId]);
}
