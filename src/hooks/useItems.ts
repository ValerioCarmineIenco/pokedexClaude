import { keepPreviousData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getErrorMessage } from '@/api/client';
import { getItem, getItemIndex, getItemPageIds, getNextItemPage } from '@/api/items';
import { queryKeys } from '@/api/queryKeys';
import type { Item, ItemCategory } from '@/types/item';
import { normalizeSearch } from '@/utils/search';

/**
 * Elenco degli oggetti a pagine da 20, di tutte le categorie o di una sola, eventualmente
 * filtrato per nome (`search`, vedi `useItemSearch`): la ricerca usa l'indice locale, quindi
 * trova anche gli oggetti non ancora caricati.
 * Ogni oggetto finisce anche nella cache di `useItem`, così il dettaglio si apre senza attese.
 *
 * Per lo scorrimento infinito: `onEndReached={() => hasNextPage && fetchNextPage()}`.
 */
export function useItems(category?: ItemCategory, search = '') {
  const queryClient = useQueryClient();
  const needle = normalizeSearch(search);
  const listKey = category ?? 'all';

  const query = useInfiniteQuery({
    queryKey: queryKeys.itemList(listKey, needle),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      Promise.all(
        getItemPageIds(pageParam, category, needle).map((id) =>
          queryClient.fetchQuery({
            queryKey: queryKeys.item(id),
            queryFn: ({ signal }) => getItem(id, signal),
          }),
        ),
      ),
    getNextPageParam: (_lastPage, _allPages, lastPageParam) =>
      getNextItemPage(lastPageParam, category, needle) ?? undefined,
    // Mentre si digita restano i risultati precedenti invece degli scheletri (solo nella
    // stessa categoria: cambiando categoria non si mostrano oggetti di un'altra).
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[2] === listKey ? keepPreviousData(previous) : undefined,
  });

  const items = useMemo<Item[]>(() => query.data?.pages.flat() ?? [], [query.data]);

  return {
    items,
    /** Oggetti totali dell'elenco, noti subito (servono per i contatori). */
    total: getItemIndex(category, needle).length,
    /** Primo caricamento, nessun dato ancora. */
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    errorMessage: query.isError ? getErrorMessage(query.error) : null,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isRefreshing: query.isRefetching && !query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    /** Per il pulsante «Riprova» e il pull-to-refresh. */
    refetch: query.refetch,
  };
}
