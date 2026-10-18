import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage } from '@/api/client';
import { fetchPokemonForms } from '@/api/forms';
import { fetchPokemonSpecies, parsePokemonId } from '@/api/pokemon';
import { queryKeys } from '@/api/queryKeys';
import { usePokemonSpecies } from '@/hooks/usePokemonSpecies';

/**
 * Forme alternative della specie (Mega, regionali, Gigamax, forme speciali), base compresa.
 * Le varietà vengono dalla specie già in cache per la scheda; se mancano (cache salvata
 * prima delle forme) la specie si riscarica. Le specie con una sola forma non fanno richieste.
 */
export function usePokemonForms(
  idParam: string | string[] | number | undefined,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const id = parsePokemonId(idParam);
  const queryClient = useQueryClient();
  const { species } = usePokemonSpecies(idParam);
  const varieties = species?.varieties;
  // Finché la specie non c'è non si sa se ha altre forme: niente scheletro.
  const mayHaveForms = species !== undefined && (varieties === undefined || varieties.length > 1);

  const query = useQuery({
    queryKey: queryKeys.pokemonForms(id ?? 0),
    queryFn: async ({ signal }) => {
      let list = varieties;
      if (list === undefined) {
        const fresh = await fetchPokemonSpecies(id as number, signal);
        queryClient.setQueryData(queryKeys.pokemonSpecies(id as number), fresh);
        list = fresh.varieties ?? [];
      }
      return list.length > 1 ? fetchPokemonForms(list, signal) : [];
    },
    enabled: enabled && id !== null && mayHaveForms,
  });

  return {
    /** Undefined se la specie ha una sola forma o le forme non sono ancora arrivate. */
    forms: query.data && query.data.length > 1 ? query.data : undefined,
    isLoading: mayHaveForms && query.isPending,
    isError: query.isError,
    errorMessage: query.isError ? getErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}
