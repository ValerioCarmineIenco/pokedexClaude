import { router } from 'expo-router';
import { useState } from 'react';

import { PokemonListView } from '@/components/PokemonListView';
import { usePokemonList } from '@/hooks/usePokemonList';
import { usePokemonSearch } from '@/hooks/usePokemonSearch';
import { useViewMode } from '@/hooks/useViewMode';

export default function PokemonListScreen() {
  const list = usePokemonList();
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useViewMode();
  const results = usePokemonSearch(list.pokemon, searchText);

  return (
    <PokemonListView
      pokemon={results}
      loadedCount={list.pokemon.length}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
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
