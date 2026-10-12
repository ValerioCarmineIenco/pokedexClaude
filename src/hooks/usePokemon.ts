import { useQuery } from '@tanstack/react-query';

import { getErrorMessage } from '@/api/client';
import { fetchPokemon, parsePokemonId } from '@/api/pokemon';
import { queryKeys } from '@/api/queryKeys';

/**
 * Dati di un Pokémon (tipi, altezza, peso, abilità, statistiche), senza descrizione.
 * Accetta direttamente il parametro di rotta: `usePokemon(useLocalSearchParams().id)`.
 * Se l'elenco l'ha già caricato, il risultato è immediato.
 */
export function usePokemon(idParam: string | string[] | number | undefined) {
  const id = parsePokemonId(idParam);

  const query = useQuery({
    queryKey: queryKeys.pokemon(id ?? 0),
    queryFn: ({ signal }) => fetchPokemon(id as number, signal),
    enabled: id !== null,
  });

  return {
    id,
    pokemon: query.data,
    isLoading: id !== null && query.isPending,
    isError: query.isError,
    /** L'id non è un Pokémon delle generazioni coperte. */
    isInvalidId: id === null,
    error: query.error,
    errorMessage: query.isError ? getErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}
