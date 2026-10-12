import { router, type Href } from 'expo-router';

import { useItems } from '@/hooks/useItems';
import { useViewMode } from '@/hooks/useViewMode';

import { ItemListView } from './ItemListView';

type Props = {
  /** Tocco sul titolo «Oggetti»: apre il menu delle sezioni. */
  onPressTitle?: () => void;
};

/** Schermata elenco oggetti di tutte le categorie, pronta da montare in una rotta. */
export function ItemListScreen({ onPressTitle }: Props) {
  const list = useItems();
  const [viewMode, setViewMode] = useViewMode('pokedex.items.viewMode');

  return (
    <ItemListView
      items={list.items}
      totalCount={list.total}
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
      onPressTitle={onPressTitle}
      onPressItem={(item) =>
        // La rotta del dettaglio la crea il thread di navigazione: il cast cade quando esiste.
        router.push({ pathname: '/items/[itemId]', params: { itemId: String(item.id) } } as Href)
      }
    />
  );
}
