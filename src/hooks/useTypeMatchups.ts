import { useQuery } from '@tanstack/react-query';

import { getErrorMessage } from '@/api/client';
import { getTypeMatchups } from '@/api/moves';
import { queryKeys } from '@/api/queryKeys';
import type { TypeName } from '@/types/pokemon';

/**
 * Efficacia di un tipo (superefficace, poco efficace, nessun effetto; debolezze e
 * resistenze). Sono solo 18 tipi: ognuno si scarica una volta e resta in cache.
 */
export function useTypeMatchups(type: TypeName | undefined) {
  const query = useQuery({
    queryKey: queryKeys.typeMatchups(type ?? 'normal'),
    queryFn: ({ signal }) => getTypeMatchups(type as TypeName, signal),
    enabled: type !== undefined,
  });

  return {
    matchups: query.data,
    isLoading: type !== undefined && query.isPending,
    isError: query.isError,
    error: query.error,
    errorMessage: query.isError ? getErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}
