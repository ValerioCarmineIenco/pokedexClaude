import { keepPreviousData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getAbility, getAbilityIndex, getAbilityPageIds, getNextAbilityPage } from '@/api/abilities';
import { getErrorMessage } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { Ability } from '@/types/ability';
import { normalizeSearch } from '@/utils/search';

/**
 * Elenco delle abilità a pagine da 20, eventualmente filtrato per nome (`search`, vedi
 * `useAbilitySearch`): la ricerca usa l'indice locale, quindi trova anche le abilità non
 * ancora caricate. Ogni abilità finisce anche nella cache di `useAbility`, così il dettaglio
 * si apre senza attese.
 *
 * Per lo scorrimento infinito: `onEndReached={() => hasNextPage && fetchNextPage()}`.
 */
export function useAbilities(search = '') {
  const queryClient = useQueryClient();
  const needle = normalizeSearch(search);

  const query = useInfiniteQuery({
    queryKey: queryKeys.abilityList(needle),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      Promise.all(
        getAbilityPageIds(pageParam, needle).map((id) =>
          queryClient.fetchQuery({
            queryKey: queryKeys.ability(id),
            queryFn: ({ signal }) => getAbility(id, signal),
          }),
        ),
      ),
    getNextPageParam: (_lastPage, _allPages, lastPageParam) =>
      getNextAbilityPage(lastPageParam, needle) ?? undefined,
    // Mentre si digita restano i risultati precedenti invece degli scheletri.
    placeholderData: keepPreviousData,
  });

  const abilities = useMemo<Ability[]>(() => query.data?.pages.flat() ?? [], [query.data]);

  return {
    abilities,
    /** Abilità totali dell'elenco, note subito (servono per i contatori). */
    total: getAbilityIndex(needle).length,
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
