import { useMemo } from 'react';

import type { Pokemon } from '@/types/pokemon';

/** Toglie maiuscole, accenti e spazi ai bordi, così «PIKA» trova «Pikachu». */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Filtra per nome i Pokémon passati (nessuna chiamata di rete). */
export function filterPokemonByName(pokemon: Pokemon[], query: string): Pokemon[] {
  const needle = normalize(query);
  if (!needle) return pokemon;
  return pokemon.filter((p) => normalize(p.name).includes(needle));
}

/**
 * Ricerca per nome tra i Pokémon già caricati.
 * Uso: `const results = usePokemonSearch(pokemon, searchText);`
 */
export function usePokemonSearch(pokemon: Pokemon[], query: string): Pokemon[] {
  return useMemo(() => filterPokemonByName(pokemon, query), [pokemon, query]);
}
