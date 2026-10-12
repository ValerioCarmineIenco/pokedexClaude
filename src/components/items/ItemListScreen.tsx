import { router, type Href } from 'expo-router';

import { useViewMode } from '@/hooks/useViewMode';

import { FALLBACK_ITEMS } from './itemFallback';
import { ItemListView } from './ItemListView';

type Props = {
  /** Tocco sul titolo «Oggetti»: apre il menu delle sezioni. */
  onPressTitle?: () => void;
};

/**
 * Schermata elenco oggetti, pronta da montare in una rotta.
 * Per ora mostra dati di ripiego: quando c'è l'hook della lista oggetti si sostituisce qui.
 */
export function ItemListScreen({ onPressTitle }: Props) {
  const [viewMode, setViewMode] = useViewMode('pokedex.items.viewMode');

  return (
    <ItemListView
      items={FALLBACK_ITEMS}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      isLoading={false}
      errorMessage={null}
      hasNextPage={false}
      isFetchingNextPage={false}
      isRefreshing={false}
      onEndReached={() => {}}
      onRefresh={() => {}}
      onRetry={() => {}}
      onPressTitle={onPressTitle}
      onPressItem={(item) =>
        // La rotta del dettaglio la crea il thread di navigazione: il cast cade quando esiste.
        router.push({ pathname: '/items/[itemId]', params: { itemId: String(item.id) } } as Href)
      }
    />
  );
}
