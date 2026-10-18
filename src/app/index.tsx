import { router } from 'expo-router';
import { useMemo, useState } from 'react';

import { getPokemonSummaries } from '@/api/pokemon';
import { PokemonListView } from '@/components/PokemonListView';
import { useFavorites } from '@/hooks/useFavorites';
import { usePokemonList } from '@/hooks/usePokemonList';
import { filterPokemonByName, usePokemonSearch } from '@/hooks/usePokemonSearch';
import { useViewMode } from '@/hooks/useViewMode';

export default function PokemonListScreen() {
  // Si parte con tutte le generazioni in sequenza.
  const [generationId, setGenerationId] = useState<number | null>(null);
  const list = usePokemonList(generationId);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useViewMode();
  const results = usePokemonSearch(searchText, generationId);
  const isSearching = searchText.trim().length > 0;
  const [favorites] = useFavorites();
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const favoritePokemon = useMemo(
    () => filterPokemonByName(getPokemonSummaries(favorites, generationId), searchText),
    [favorites, generationId, searchText],
  );

  return (
    <PokemonListView
      pokemon={favoritesOnly ? favoritePokemon : isSearching ? results : list.pokemon}
      loadedCount={list.pokemon.length}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      generationId={generationId}
      onGenerationChange={setGenerationId}
      favoritesOnly={favoritesOnly}
      onFavoritesOnlyChange={setFavoritesOnly}
      favoritesCount={favorites.size}
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
