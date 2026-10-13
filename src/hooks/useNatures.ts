import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getErrorMessage } from '@/api/client';
import { getNatureIndex, getNatures } from '@/api/natures';
import { queryKeys } from '@/api/queryKeys';
import type { Nature } from '@/types/nature';

/**
 * Elenco delle 25 nature, eventualmente filtrato per nome (`search`, vedi `useNatureSearch`).
 * Si scaricano tutte insieme una volta sola; la ricerca usa l'indice locale e non rifà
 * chiamate, quindi i risultati sono immediati.
 */
export function useNatures(search = '') {
  const query = useQuery({
    queryKey: queryKeys.natures(),
    queryFn: ({ signal }) => getNatures(signal),
  });

  const matches = useMemo(() => getNatureIndex(search), [search]);
  const natures = useMemo<Nature[]>(() => {
    if (!query.data) return [];
    const ids = new Set(matches.map((entry) => entry.id));
    return query.data.filter((nature) => ids.has(nature.id));
  }, [query.data, matches]);

  return {
    natures,
    /** Nature dell'elenco (della ricerca, se filtrato), note subito anche prima del caricamento. */
    total: matches.length,
    /** Primo caricamento, nessun dato ancora. */
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    errorMessage: query.isError ? getErrorMessage(query.error) : null,
    isRefreshing: query.isRefetching,
    /** Per il pulsante «Riprova» e il pull-to-refresh. */
    refetch: query.refetch,
  };
}
