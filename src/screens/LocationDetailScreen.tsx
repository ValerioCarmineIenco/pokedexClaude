import { router, useLocalSearchParams } from 'expo-router';

import { LocationDetailView } from '@/components/locations/LocationDetailView';
import { useLocation } from '@/hooks/useLocation';

/**
 * Schermata dettaglio località. Il file di rotta la riesporta:
 * `export { default } from '@/screens/LocationDetailScreen';`
 */
export default function LocationDetailScreen() {
  const { locationId } = useLocalSearchParams<{ locationId: string }>();
  const detail = useLocation(locationId);

  return (
    <LocationDetailView
      summary={detail.summary}
      location={detail.location}
      isLoading={detail.isLoading}
      errorMessage={detail.errorMessage}
      isInvalidId={detail.isInvalidId}
      // La scheda del Pokémon si impila: "Indietro" riporta a questa località.
      onOpenPokemon={(id) =>
        router.push({ pathname: '/pokemon/[id]', params: { id: String(id) } })
      }
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      onRetry={() => void detail.refetch()}
    />
  );
}
