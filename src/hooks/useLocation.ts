import { useQuery } from '@tanstack/react-query';

import { getErrorMessage } from '@/api/client';
import { getLocation, getLocationSummary, parseLocationId } from '@/api/locations';
import { queryKeys } from '@/api/queryKeys';

/**
 * Dettaglio di una località: aree e, per ognuna, i Pokémon raggruppati per metodo d'incontro.
 * Accetta direttamente il parametro di rotta:
 * `useLocation(useLocalSearchParams<{ locationId: string }>().locationId)`.
 * `summary` (nome, regione, contatori) arriva subito dall'indice locale, prima della rete.
 */
export function useLocation(idParam: string | string[] | number | undefined) {
  const id = parseLocationId(idParam);

  const query = useQuery({
    queryKey: queryKeys.location(id ?? 0),
    queryFn: ({ signal }) => getLocation(id as number, signal),
    enabled: id !== null,
  });

  return {
    id,
    /** Dati dell'elenco, per l'intestazione mentre il dettaglio carica. */
    summary: id !== null ? getLocationSummary(id) : undefined,
    location: query.data,
    isLoading: id !== null && query.isPending,
    isError: query.isError,
    /** L'id non è tra le località dell'app. */
    isInvalidId: id === null,
    error: query.error,
    errorMessage: query.isError ? getErrorMessage(query.error) : null,
    isRefreshing: query.isRefetching,
    refetch: query.refetch,
  };
}
