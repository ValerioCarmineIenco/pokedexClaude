import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getErrorMessage } from '@/api/client';
import { fetchPokemon, fetchPokemonPage, LAST_POKEMON_ID, PAGE_SIZE } from '@/api/pokemon';
import { queryKeys } from '@/api/queryKeys';
import type { Pokemon } from '@/types/pokemon';

/**
 * Elenco della Gen 1 a pagine da 20, con i dati completi di ogni Pokémon
 * (servono i tipi per colorare le card). Ogni Pokémon finisce anche nella
 * cache di `usePokemon`, così il dettaglio si apre senza attese.
 *
 * Per lo scorrimento infinito: `onEndReached={() => hasNextPage && fetchNextPage()}`.
 */
export function usePokemonList() {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: queryKeys.pokemonList,
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }) => {
      const refs = await fetchPokemonPage(pageParam, signal);
      return Promise.all(
        refs.map(({ id }) =>
          queryClient.fetchQuery({
            queryKey: queryKeys.pokemon(id),
            queryFn: ({ signal: s }) => fetchPokemon(id, s),
          }),
        ),
      );
    },
    getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
      const next = lastPageParam + PAGE_SIZE;
      return next < LAST_POKEMON_ID ? next : undefined;
    },
  });

  const pokemon = useMemo<Pokemon[]>(() => query.data?.pages.flat() ?? [], [query.data]);

  return {
    pokemon,
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
