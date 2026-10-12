import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getErrorMessage } from '@/api/client';
import { getPokemonRange } from '@/api/generations';
import { fetchPokemon, fetchPokemonPage, PAGE_SIZE } from '@/api/pokemon';
import { queryKeys } from '@/api/queryKeys';
import type { Pokemon } from '@/types/pokemon';

/**
 * Elenco a pagine da 20: tutte le generazioni in sequenza, oppure solo quella
 * passata (`usePokemonList(2)` per la Gen 2, id da `GENERATIONS`). Ogni pagina
 * ha i dati completi di ogni Pokémon (servono i tipi per colorare le card). Ogni Pokémon finisce anche nella
 * cache di `usePokemon`, così il dettaglio si apre senza attese.
 *
 * Per lo scorrimento infinito: `onEndReached={() => hasNextPage && fetchNextPage()}`.
 */
export function usePokemonList(generationId: number | null = null) {
  const queryClient = useQueryClient();
  const { firstId, lastId } = getPokemonRange(generationId);

  const query = useInfiniteQuery({
    queryKey: queryKeys.pokemonList(generationId),
    // Offset di PokéAPI: l'id 152 è all'offset 151.
    initialPageParam: firstId - 1,
    queryFn: async ({ pageParam, signal }) => {
      const refs = await fetchPokemonPage(pageParam, signal, generationId);
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
      return next < lastId ? next : undefined;
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
