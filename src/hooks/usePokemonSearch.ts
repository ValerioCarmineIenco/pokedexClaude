import { useMemo } from 'react';

/** Toglie maiuscole, accenti e spazi ai bordi, così «PIKA» trova «pikachu». */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Filtra per nome i Pokémon passati (nessuna chiamata di rete). */
export function filterPokemonByName<T extends { name: string }>(pokemon: T[], query: string): T[] {
  const needle = normalize(query);
  if (!needle) return pokemon;
  return pokemon.filter((p) => normalize(p.name).includes(needle));
}

/**
 * Ricerca per nome tra i Pokémon già caricati.
 * Uso: `const results = usePokemonSearch(pokemon, searchText);`
 */
export function usePokemonSearch<T extends { name: string }>(pokemon: T[], query: string): T[] {
  return useMemo(() => filterPokemonByName(pokemon, query), [pokemon, query]);
}
