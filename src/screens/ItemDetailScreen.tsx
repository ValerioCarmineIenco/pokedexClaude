import { router, useLocalSearchParams } from 'expo-router';

import { ItemDetailView } from '@/components/ItemDetailView';
import { useItemDetail } from '@/hooks/useItemDetail';

/**
 * Schermata dettaglio oggetto. Il file di rotta la riesporta:
 * `export { default } from '@/screens/ItemDetailScreen';`
 */
export default function ItemDetailScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const detail = useItemDetail(itemId);

  return (
    <ItemDetailView
      item={detail.item}
      isLoading={detail.isLoading}
      errorMessage={detail.errorMessage}
      isInvalidId={detail.isInvalidId}
      related={detail.related}
      isRelatedLoading={detail.isRelatedLoading}
      // Un correlato sostituisce il dettaglio corrente invece di impilarsi:
      // "Indietro" (anche gesto o tasto di sistema) torna sempre all'elenco,
      // pure dopo una catena di correlati.
      onOpenItem={(id) =>
        router.replace({ pathname: '/items/[itemId]', params: { itemId: String(id) } })
      }
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/items'))}
      onRetry={detail.refetch}
    />
  );
}
