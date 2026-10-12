import { useQuery } from '@tanstack/react-query';

import { getErrorMessage } from '@/api/client';
import { fetchPokemonSpecies, parsePokemonId } from '@/api/pokemon';
import { queryKeys } from '@/api/queryKeys';

/** Descrizione italiana e categoria di un Pokémon, per il dettaglio. */
export function usePokemonSpecies(idParam: string | string[] | number | undefined) {
  const id = parsePokemonId(idParam);

  const query = useQuery({
    queryKey: queryKeys.pokemonSpecies(id ?? 0),
    queryFn: ({ signal }) => fetchPokemonSpecies(id as number, signal),
    enabled: id !== null,
  });

  return {
    species: query.data,
    isLoading: id !== null && query.isPending,
    isError: query.isError,
    error: query.error,
    errorMessage: query.isError ? getErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}
