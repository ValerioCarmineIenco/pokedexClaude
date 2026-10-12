import { useQuery } from '@tanstack/react-query';

import { getErrorMessage } from '@/api/client';
import { getItem, getRelatedItems } from '@/api/itemsFallback';

/** Numero massimo di correlati mostrati nel dettaglio. */
export const MAX_RELATED_ITEMS = 5;

function parseItemId(param: string | string[] | number | undefined): number | null {
  const raw = Array.isArray(param) ? param[0] : param;
  const id = typeof raw === 'number' ? raw : Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * Oggetto e correlati per la schermata di dettaglio.
 * Uso: `useItemDetail(useLocalSearchParams<{ itemId: string }>().itemId)`.
 * I correlati arrivano a parte: se falliscono, la scheda si mostra comunque.
 */
export function useItemDetail(idParam: string | string[] | number | undefined) {
  const id = parseItemId(idParam);

  const item = useQuery({
    queryKey: ['items', 'detail', id ?? 0],
    queryFn: () => getItem(id as number),
    enabled: id !== null,
  });

  const related = useQuery({
    queryKey: ['items', 'related', id ?? 0],
    queryFn: () => getRelatedItems(id as number),
    enabled: id !== null,
  });

  return {
    id,
    item: item.data,
    isLoading: id !== null && item.isPending,
    isInvalidId: id === null,
    errorMessage: item.isError ? getErrorMessage(item.error) : null,
    related: related.data?.slice(0, MAX_RELATED_ITEMS),
    isRelatedLoading: id !== null && related.isPending,
    refetch: () => {
      void item.refetch();
      if (related.isError) void related.refetch();
    },
  };
}
