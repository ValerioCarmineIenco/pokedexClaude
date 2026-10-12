import { router, useLocalSearchParams } from 'expo-router';

import { getAdjacentIds } from '@/api/pokemon';
import { PokemonDetailView } from '@/components/PokemonDetailView';
import { usePokemonDetail } from '@/hooks/usePokemonDetail';

export default function PokemonDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const detail = usePokemonDetail(idParam);
  const { previous, next } =
    detail.id === null ? { previous: null, next: null } : getAdjacentIds(detail.id);

  return (
    <PokemonDetailView
      pokemon={detail.pokemon}
      isLoading={detail.isLoading}
      isDescriptionLoading={detail.isDescriptionLoading}
      errorMessage={detail.errorMessage}
      isInvalidId={detail.isInvalidId}
      previousId={previous}
      nextId={next}
      // Sostituisce la scheda invece di impilarla: "Indietro" torna sempre all'elenco.
      onNavigate={(id) => router.replace({ pathname: '/pokemon/[id]', params: { id: String(id) } })}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      onRetry={() => detail.refetch()}
    />
  );
}
