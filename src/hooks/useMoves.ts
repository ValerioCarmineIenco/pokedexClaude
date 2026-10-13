import { useMemo } from 'react';

import { getMoves } from '@/api/moves';
import type { MoveSummary } from '@/types/move';

/**
 * Elenco delle mosse, eventualmente filtrato per nome (`search`, vedi `useMoveSearch`).
 * Nome, tipo, classe, potenza, precisione e PP sono nell'indice locale: niente rete,
 * niente caricamento, la lista è completa da subito. Il resto lo carica `useMove`.
 */
export function useMoves(search = '') {
  const moves = useMemo<MoveSummary[]>(() => getMoves(search), [search]);

  return {
    moves,
    /** Mosse dell'elenco (della ricerca, se filtrato). */
    total: moves.length,
  };
}
