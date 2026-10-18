import { router } from 'expo-router';
import { useMemo, useState } from 'react';

import { getPokemonSummaries, queryPokemonIndex } from '@/api/pokemon';
import { countActiveFilters } from '@/components/PokemonFilterSheet';
import { PokemonListView } from '@/components/PokemonListView';
import { useFavorites } from '@/hooks/useFavorites';
import { usePokemonList } from '@/hooks/usePokemonList';
import { useShinyCaught } from '@/hooks/useShinyCaught';
import { useViewMode } from '@/hooks/useViewMode';
import { DEFAULT_POKEMON_FILTERS, type PokemonCollection, type PokemonFilters } from '@/types/pokemon';

export default function PokemonListScreen() {
  // Si parte con tutte le generazioni in sequenza.
  const [generationId, setGenerationId] = useState<number | null>(null);
  const list = usePokemonList(generationId);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useViewMode();
  const [filters, setFilters] = useState<PokemonFilters>(DEFAULT_POKEMON_FILTERS);
  const isSearching = searchText.trim().length > 0;
  const isFiltering = countActiveFilters(filters) > 0;
  const [favorites] = useFavorites();
  const [shinyCaught] = useShinyCaught();
  const [collection, setCollection] = useState<PokemonCollection | null>(null);
  const shinyInScope = useMemo(
    () => getPokemonSummaries(shinyCaught, generationId).length,
    [shinyCaught, generationId],
  );
  const collectionIds = collection === 'shiny' ? shinyCaught : favorites;
  // Ricerca, raccolte e filtri leggono l'indice statico: tutti i Pokémon, anche non caricati.
  const matches = useMemo(
    () =>
      queryPokemonIndex({
        search: searchText,
        generationId,
        ids: collection ? collectionIds : undefined,
        filters,
      }),
    [searchText, generationId, collection, collectionIds, filters],
  );

  return (
    <PokemonListView
      pokemon={collection || isSearching || isFiltering ? matches : list.pokemon}
      loadedCount={list.pokemon.length}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      generationId={generationId}
      onGenerationChange={setGenerationId}
      collection={collection}
      onCollectionChange={setCollection}
      collectionCount={collectionIds.size}
      shinyCount={shinyInScope}
      filters={filters}
      onFiltersChange={setFilters}
      matchCount={matches.length}
      isLoading={list.isLoading}
      errorMessage={list.errorMessage}
      hasNextPage={list.hasNextPage}
      isFetchingNextPage={list.isFetchingNextPage}
      isRefreshing={list.isRefreshing}
      onEndReached={() => {
        if (list.hasNextPage && !list.isFetchingNextPage) list.fetchNextPage();
      }}
      onRefresh={() => list.refetch()}
      onRetry={() => list.refetch()}
      onPressPokemon={(pokemon) =>
        router.push({ pathname: '/pokemon/[id]', params: { id: String(pokemon.id) } })
      }
      onOpenSettings={() => router.push('/settings')}
    />
  );
}
