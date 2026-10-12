import { useItem } from '@/hooks/useItem';
import { useRelatedItems } from '@/hooks/useRelatedItems';

/**
 * Oggetto e correlati (al massimo 5) per la schermata di dettaglio.
 * Uso: `useItemDetail(useLocalSearchParams<{ itemId: string }>().itemId)`.
 * I correlati arrivano a parte: se falliscono, la scheda si mostra comunque.
 */
export function useItemDetail(idParam: string | string[] | number | undefined) {
  const base = useItem(idParam);
  const related = useRelatedItems(idParam);

  return {
    id: base.id,
    item: base.item,
    isLoading: base.isLoading,
    /** L'id non è tra gli oggetti dell'app. */
    isInvalidId: base.isInvalidId,
    errorMessage: base.errorMessage,
    related: related.items,
    isRelatedLoading: related.isLoading,
    refetch: () => {
      void base.refetch();
      related.refetch();
    },
  };
}
