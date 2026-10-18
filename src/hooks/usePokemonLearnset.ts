import { useQuery } from '@tanstack/react-query';

import { getErrorMessage } from '@/api/client';
import { fetchPokemonLearnset } from '@/api/learnset';
import { parsePokemonId } from '@/api/pokemon';
import { queryKeys } from '@/api/queryKeys';

/**
 * Mosse apprese dal Pokémon, per gruppo di giochi.
 * Con `enabled: false` non parte nessuna richiesta (es. finché la tab Mosse è chiusa).
 */
export function usePokemonLearnset(
  idParam: string | string[] | number | undefined,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const id = parsePokemonId(idParam);

  const query = useQuery({
    queryKey: queryKeys.pokemonLearnset(id ?? 0),
    queryFn: ({ signal }) => fetchPokemonLearnset(id as number, signal),
    enabled: enabled && id !== null,
  });

  return {
    learnset: query.data,
    isLoading: id !== null && query.isPending,
    isError: query.isError,
    error: query.error,
    errorMessage: query.isError ? getErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}
