import { router, useLocalSearchParams } from 'expo-router';

import { MoveDetailView } from '@/components/moves/MoveDetailView';
import { useMove } from '@/hooks/useMove';

/**
 * Schermata dettaglio mossa. Il file di rotta la riesporta:
 * `export { default } from '@/screens/MoveDetailScreen';`
 */
export default function MoveDetailScreen() {
  const { moveId } = useLocalSearchParams<{ moveId: string }>();
  const detail = useMove(moveId);

  return (
    <MoveDetailView
      summary={detail.summary}
      move={detail.move}
      matchups={detail.matchups}
      isLoading={detail.isLoading}
      errorMessage={detail.errorMessage}
      isInvalidId={detail.isInvalidId}
      // La scheda del Pokémon si impila: "Indietro" riporta a questa mossa.
      onOpenPokemon={(id) =>
        router.push({ pathname: '/pokemon/[id]', params: { id: String(id) } })
      }
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/moves'))}
      onRetry={() => void detail.refetch()}
    />
  );
}
