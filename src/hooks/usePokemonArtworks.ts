import { useQuery } from '@tanstack/react-query';

import { fetchPokemonArtworks } from '@/api/artworks';
import { getErrorMessage } from '@/api/client';
import { parsePokemonId } from '@/api/pokemon';
import { queryKeys } from '@/api/queryKeys';

/**
 * Tutte le immagini di un Pokémon, raggruppate per fonte e per gioco.
 * Con `enabled: false` non parte nessuna richiesta (es. finché la tab Artwork è chiusa).
 */
export function usePokemonArtworks(
  idParam: string | string[] | number | undefined,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const id = parsePokemonId(idParam);

  const query = useQuery({
    queryKey: queryKeys.pokemonArtworks(id ?? 0),
    queryFn: ({ signal }) => fetchPokemonArtworks(id as number, signal),
    enabled: enabled && id !== null,
  });

  return {
    artworks: query.data,
    isLoading: id !== null && query.isPending,
    isError: query.isError,
    error: query.error,
    errorMessage: query.isError ? getErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}
