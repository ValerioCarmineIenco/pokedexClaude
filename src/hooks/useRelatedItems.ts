import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getErrorMessage } from '@/api/client';
import { getItem, getRelatedIds, parseItemId } from '@/api/items';
import { queryKeys } from '@/api/queryKeys';
import type { Item } from '@/types/item';

/**
 * Fino a 5 oggetti correlati, per il dettaglio. Gli id sono noti subito; ogni oggetto
 * usa la cache di `useItem`. Se uno solo fallisce, gli altri si mostrano comunque.
 */
export function useRelatedItems(idParam: string | string[] | number | undefined) {
  const id = parseItemId(idParam);
  const relatedIds = useMemo(() => (id === null ? [] : getRelatedIds(id)), [id]);

  const queries = useQueries({
    queries: relatedIds.map((relatedId) => ({
      queryKey: queryKeys.item(relatedId),
      queryFn: ({ signal }: { signal: AbortSignal }) => getItem(relatedId, signal),
    })),
  });

  const items = queries.flatMap((q) => (q.data ? [q.data] : [])) satisfies Item[];
  const failed = queries.find((q) => q.isError);

  return {
    relatedIds,
    /** Nell'ordine di `relatedIds`, solo quelli già arrivati. */
    items,
    isLoading: queries.some((q) => q.isPending),
    isError: items.length === 0 && failed !== undefined,
    errorMessage: failed ? getErrorMessage(failed.error) : null,
    refetch: () => queries.forEach((q) => q.isError && void q.refetch()),
  };
}
