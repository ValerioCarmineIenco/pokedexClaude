import { useQueries } from '@tanstack/react-query';

import { getErrorMessage } from '@/api/client';
import { getTypeMatchups } from '@/api/moves';
import { queryKeys } from '@/api/queryKeys';
import type { TypeName } from '@/types/pokemon';
import { getDefenseGroups } from '@/utils/typeEffectiveness';

/**
 * Debolezze e resistenze di un Pokémon, combinando i suoi uno o due tipi. Usa le stesse
 * query di `useTypeMatchups`, quindi la cache (anche offline) è condivisa con le mosse.
 */
export function usePokemonTypeDefense(types: TypeName[] | undefined) {
  const queries = useQueries({
    queries: (types ?? []).map((type) => ({
      queryKey: queryKeys.typeMatchups(type),
      queryFn: ({ signal }: { signal: AbortSignal }) => getTypeMatchups(type, signal),
    })),
  });

  const matchups = queries.map((query) => query.data);
  const ready = types !== undefined && matchups.every((entry) => entry !== undefined);
  const failed = queries.find((query) => query.isError);

  return {
    /** `undefined` finché i dati di tutti i tipi non sono arrivati. */
    groups: ready ? getDefenseGroups(matchups.filter((entry) => entry !== undefined)) : undefined,
    isLoading: types !== undefined && queries.some((query) => query.isPending && !query.isError),
    isError: failed !== undefined,
    errorMessage: failed ? getErrorMessage(failed.error) : null,
    refetch: () => Promise.all(queries.map((query) => query.refetch())),
  };
}
