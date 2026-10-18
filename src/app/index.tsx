import { router } from 'expo-router';
import { useMemo, useState } from 'react';

import { getPokemonSummaries } from '@/api/pokemon';
import { PokemonListView } from '@/components/PokemonListView';
import { useFavorites } from '@/hooks/useFavorites';
import { usePokemonList } from '@/hooks/usePokemonList';
import { filterPokemonByName, usePokemonSearch } from '@/hooks/usePokemonSearch';
import { useShinyCaught } from '@/hooks/useShinyCaught';
import { useViewMode } from '@/hooks/useViewMode';
import type { PokemonCollection } from '@/types/pokemon';

export default function PokemonListScreen() {
  // Si parte con tutte le generazioni in sequenza.
  const [generationId, setGenerationId] = useState<number | null>(null);
  const list = usePokemonList(generationId);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useViewMode();
  const results = usePokemonSearch(searchText, generationId);
  const isSearching = searchText.trim().length > 0;
  const [favorites] = useFavorites();
  const [shinyCaught] = useShinyCaught();
  const [collection, setCollection] = useState<PokemonCollection | null>(null);
  const shinyInScope = useMemo(
    () => getPokemonSummaries(shinyCaught, generationId).length,
    [shinyCaught, generationId],
  );
  const collectionIds = collection === 'shiny' ? shinyCaught : favorites;
  const collectionPokemon = useMemo(
    () => filterPokemonByName(getPokemonSummaries(collectionIds, generationId), searchText),
    [collectionIds, generationId, searchText],
  );

  return (
    <PokemonListView
      pokemon={collection ? collectionPokemon : isSearching ? results : list.pokemon}
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
