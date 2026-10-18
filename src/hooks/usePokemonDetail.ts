import { useMemo } from 'react';

import { usePokemon } from '@/hooks/usePokemon';
import { usePokemonSpecies } from '@/hooks/usePokemonSpecies';
import type { PokemonDetail } from '@/types/pokemon';

/**
 * Scheda completa per la schermata di dettaglio: dati del Pokémon più descrizione nella lingua in uso.
 * Se la descrizione non arriva, la scheda si mostra comunque con `description: null`.
 * Uso: `const { pokemon, isLoading, errorMessage, refetch } = usePokemonDetail(useLocalSearchParams().id);`
 */
export function usePokemonDetail(idParam: string | string[] | number | undefined) {
  const base = usePokemon(idParam);
  const species = usePokemonSpecies(idParam);

  const pokemon = useMemo<PokemonDetail | undefined>(
    () =>
      base.pokemon && {
        ...base.pokemon,
        description: species.species?.description ?? null,
      },
    [base.pokemon, species.species],
  );

  return {
    id: base.id,
    pokemon,
    genus: species.species?.genus ?? null,
    isLoading: base.isLoading,
    /** La descrizione sta ancora arrivando (i dati principali possono già essere mostrati). */
    isDescriptionLoading: species.isLoading,
    isError: base.isError,
    isInvalidId: base.isInvalidId,
    error: base.error,
    errorMessage: base.errorMessage,
    refetch: () => {
      void base.refetch();
      if (species.isError) void species.refetch();
    },
  };
}
