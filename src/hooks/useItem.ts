import { useQuery } from '@tanstack/react-query';

import { getErrorMessage } from '@/api/client';
import { getItem, parseItemId } from '@/api/items';
import { queryKeys } from '@/api/queryKeys';

/**
 * Dettaglio di un oggetto. Accetta direttamente il parametro di rotta:
 * `useItem(useLocalSearchParams().id)`. Se l'elenco l'ha già caricato, il risultato è immediato.
 */
export function useItem(idParam: string | string[] | number | undefined) {
  const id = parseItemId(idParam);

  const query = useQuery({
    queryKey: queryKeys.item(id ?? 0),
    queryFn: ({ signal }) => getItem(id as number, signal),
    enabled: id !== null,
  });

  return {
    id,
    item: query.data,
    isLoading: id !== null && query.isPending,
    isError: query.isError,
    /** L'id non è tra gli oggetti dell'app. */
    isInvalidId: id === null,
    error: query.error,
    errorMessage: query.isError ? getErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}
