import { useQuery } from '@tanstack/react-query';

import { getAbility, parseAbilityId } from '@/api/abilities';
import { getErrorMessage } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';

/**
 * Dettaglio di un'abilità (effetto e Pokémon che la possiedono). Accetta direttamente il
 * parametro di rotta: `useAbility(useLocalSearchParams<{ abilityId: string }>().abilityId)`.
 * Se l'elenco l'ha già caricata, il risultato è immediato.
 */
export function useAbility(idParam: string | string[] | number | undefined) {
  const id = parseAbilityId(idParam);

  const query = useQuery({
    queryKey: queryKeys.ability(id ?? 0),
    queryFn: ({ signal }) => getAbility(id as number, signal),
    enabled: id !== null,
  });

  return {
    id,
    ability: query.data,
    isLoading: id !== null && query.isPending,
    isError: query.isError,
    /** L'id non è tra le abilità dell'app. */
    isInvalidId: id === null,
    error: query.error,
    errorMessage: query.isError ? getErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}
