// Hook finti con la stessa forma di usePokemonList / usePokemonDetail: simulano attesa e
// paginazione con i dati d'esempio. Per collegare i dati veri basta cambiare l'import.
import { useCallback, useEffect, useState } from 'react';

import { PAGE_SIZE, parsePokemonId } from '@/api/pokemon';

import { MOCK_POKEMON, mockDetail } from './pokemon';

const DELAY_MS = 700;

export function useMockPokemonList() {
  const [count, setCount] = useState(0);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCount(PAGE_SIZE), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const fetchNextPage = useCallback(() => {
    setIsFetchingNextPage(true);
    setTimeout(() => {
      setCount((c) => Math.min(c + PAGE_SIZE, MOCK_POKEMON.length));
      setIsFetchingNextPage(false);
    }, DELAY_MS);
  }, []);

  const refetch = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), DELAY_MS);
  }, []);

  return {
    pokemon: MOCK_POKEMON.slice(0, count),
    isLoading: count === 0,
    isError: false,
    errorMessage: null as string | null,
    hasNextPage: count > 0 && count < MOCK_POKEMON.length,
    isFetchingNextPage,
    isRefreshing,
    fetchNextPage,
    refetch,
  };
}

/** Come usePokemonDetail: i dati principali sono subito pronti (cache dell'elenco), la descrizione arriva dopo. */
export function useMockPokemonDetail(idParam: string | string[] | number | undefined) {
  const id = parsePokemonId(idParam);
  const [describedId, setDescribedId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDescribedId(id), DELAY_MS);
    return () => clearTimeout(timer);
  }, [id]);

  const detail = id === null ? undefined : mockDetail(id);
  const isDescriptionLoading = id !== null && describedId !== id;

  return {
    id,
    pokemon: detail && (isDescriptionLoading ? { ...detail, description: null } : detail),
    isLoading: false,
    isDescriptionLoading,
    isError: false,
    isInvalidId: id === null,
    errorMessage: null as string | null,
    refetch: () => {},
  };
}
