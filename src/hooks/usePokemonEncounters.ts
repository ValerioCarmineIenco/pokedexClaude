import { useQuery } from '@tanstack/react-query';

import { getErrorMessage } from '@/api/client';
import { getPokemonEncounters } from '@/api/locations';
import { parsePokemonId } from '@/api/pokemon';
import { queryKeys } from '@/api/queryKeys';

/** «Dove trovarlo» nella scheda: località per gioco, da `/pokemon/{id}/encounters`. */
export function usePokemonEncounters(
  idParam: string | string[] | number | undefined,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const id = parsePokemonId(idParam);

  const query = useQuery({
    queryKey: queryKeys.pokemonEncounters(id ?? 0),
    queryFn: ({ signal }) => getPokemonEncounters(id as number, signal),
    enabled: enabled && id !== null,
  });

  return {
    /** Vuoto se il Pokémon non si incontra in natura. */
    groups: query.data,
    isLoading: id !== null && query.isPending,
    isError: query.isError,
    errorMessage: query.isError ? getErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}
