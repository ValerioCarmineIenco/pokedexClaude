import { router, useLocalSearchParams } from 'expo-router';

import { ItemDetailView } from '@/components/ItemDetailView';
import { useItemDetail } from '@/hooks/useItemDetail';

/** Rotta del dettaglio oggetto, usata anche per aprire i correlati. */
export const ITEM_DETAIL_PATHNAME = '/items/[itemId]';

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
      // `as never`: la rotta tipizzata esiste solo dopo che il thread di navigazione la registra.
      // Ogni correlato si impila: "Indietro" torna all'oggetto precedente.
      onOpenItem={(id) =>
        router.push({ pathname: ITEM_DETAIL_PATHNAME as never, params: { itemId: String(id) } })
      }
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      onRetry={detail.refetch}
    />
  );
}
