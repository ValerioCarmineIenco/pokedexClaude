import { router } from 'expo-router';
import { useState } from 'react';

import { useItemSearch } from '@/hooks/useItemSearch';
import { useItems } from '@/hooks/useItems';
import { useViewMode } from '@/hooks/useViewMode';
import type { ItemCategory } from '@/types/item';

import { ItemListView } from './ItemListView';

/** Schermata elenco oggetti, di tutte le categorie o di una sola, pronta da montare in una rotta. */
export function ItemListScreen() {
  const search = useItemSearch();
  // Si parte con tutte le categorie in sequenza.
  const [category, setCategory] = useState<ItemCategory | null>(null);
  const list = useItems(category ?? undefined, search.query);
  const [viewMode, setViewMode] = useViewMode('pokedex.items.viewMode');

  return (
    <ItemListView
      items={list.items}
      totalCount={list.total}
      searchText={search.text}
      onSearchTextChange={search.setText}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      category={category}
      onCategoryChange={setCategory}
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
      onPressItem={(item) =>
        router.push({ pathname: '/items/[itemId]', params: { itemId: String(item.id) } })
      }
    />
  );
}
