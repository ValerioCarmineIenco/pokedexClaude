import { useQuery } from '@tanstack/react-query';

import { getErrorMessage } from '@/api/client';
import { getMove, getMoveSummary, parseMoveId } from '@/api/moves';
import { queryKeys } from '@/api/queryKeys';
import { useTypeMatchups } from '@/hooks/useTypeMatchups';

/**
 * Dettaglio di una mossa più l'efficacia del suo tipo. Accetta direttamente il parametro di
 * rotta: `useMove(useLocalSearchParams<{ moveId: string }>().moveId)`.
 *
 * `summary` (nome, tipo, potenza, precisione, PP) è pronto subito dall'indice locale, così
 * l'intestazione si disegna senza attese; il tipo è noto in anticipo, quindi mossa ed
 * efficacia si scaricano in parallelo.
 */
export function useMove(idParam: string | string[] | number | undefined) {
  const id = parseMoveId(idParam);
  const summary = id === null ? undefined : getMoveSummary(id);

  const query = useQuery({
    queryKey: queryKeys.move(id ?? 0),
    queryFn: ({ signal }) => getMove(id as number, signal),
    enabled: id !== null,
  });
  const matchups = useTypeMatchups(summary?.type);

  const isError = query.isError || matchups.isError;
  const error = query.error ?? matchups.error;

  return {
    id,
    /** Dati dell'elenco, subito disponibili. */
    summary,
    move: query.data,
    /** Efficacia del tipo della mossa (per le mosse di stato conta poco: decide la UI). */
    matchups: matchups.matchups,
    isLoading: id !== null && (query.isPending || matchups.isLoading),
    isError,
    /** L'id non è tra le mosse dell'app. */
    isInvalidId: id === null,
    error,
    errorMessage: isError ? getErrorMessage(error) : null,
    refetch: () => Promise.all([query.refetch(), matchups.refetch()]),
  };
}
