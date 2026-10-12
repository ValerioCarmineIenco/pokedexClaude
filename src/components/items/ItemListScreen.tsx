import { router } from 'expo-router';

import { useItemSearch } from '@/hooks/useItemSearch';
import { useItems } from '@/hooks/useItems';
import { useViewMode } from '@/hooks/useViewMode';

import { ItemListView } from './ItemListView';

/** Schermata elenco oggetti di tutte le categorie, pronta da montare in una rotta. */
export function ItemListScreen() {
  const search = useItemSearch();
  const list = useItems(undefined, search.query);
  const [viewMode, setViewMode] = useViewMode('pokedex.items.viewMode');

  return (
    <ItemListView
      items={list.items}
      totalCount={list.total}
      searchText={search.text}
      onSearchTextChange={search.setText}
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
      onPressItem={(item) =>
        router.push({ pathname: '/items/[itemId]', params: { itemId: String(item.id) } })
      }
    />
  );
}
