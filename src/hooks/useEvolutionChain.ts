import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage } from '@/api/client';
import { fetchEvolutionChain } from '@/api/evolutions';
import { fetchPokemonSpecies, parsePokemonId } from '@/api/pokemon';
import { queryKeys } from '@/api/queryKeys';
import { t } from '@/i18n';
import type { PokemonSpecies } from '@/types/pokemon';

/**
 * Catena evolutiva del Pokémon. L'id della catena viene dalla specie già in cache per la
 * scheda; se manca (cache salvata prima delle evoluzioni) la specie si riscarica.
 * Con `enabled: false` non parte nessuna richiesta (es. finché la tab Evoluzioni è chiusa).
 */
export function useEvolutionChain(
  idParam: string | string[] | number | undefined,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const id = parsePokemonId(idParam);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.evolutionChain(id ?? 0),
    queryFn: async ({ signal }) => {
      const speciesKey = queryKeys.pokemonSpecies(id as number);
      let chainId = queryClient.getQueryData<PokemonSpecies>(speciesKey)?.evolutionChainId;
      if (chainId === undefined) {
        const species = await fetchPokemonSpecies(id as number, signal);
        queryClient.setQueryData(speciesKey, species);
        chainId = species.evolutionChainId;
      }
      if (chainId == null) throw new Error(t('evolution:chain.unavailable'));
      return fetchEvolutionChain(chainId, signal);
    },
    enabled: enabled && id !== null,
  });

  return {
    chain: query.data,
    isLoading: id !== null && query.isPending,
    isError: query.isError,
    error: query.error,
    errorMessage: query.isError ? getErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}
