import { router, useLocalSearchParams, type Href } from 'expo-router';

import { AbilityDetailView } from '@/components/abilities/AbilityDetailView';
import { useAbility } from '@/hooks/useAbility';

/**
 * Schermata dettaglio abilità. Il file di rotta la riesporta:
 * `export { default } from '@/screens/AbilityDetailScreen';`
 */
export default function AbilityDetailScreen() {
  const { abilityId } = useLocalSearchParams<{ abilityId: string }>();
  const detail = useAbility(abilityId);

  return (
    <AbilityDetailView
      ability={detail.ability}
      isLoading={detail.isLoading}
      errorMessage={detail.errorMessage}
      isInvalidId={detail.isInvalidId}
      // La scheda del Pokémon si impila: "Indietro" riporta a questa abilità.
      onOpenPokemon={(id) =>
        router.push({ pathname: '/pokemon/[id]', params: { id: String(id) } })
      }
      // L'elenco abilità arriva con la PR #18: il cast si può togliere quando è su main.
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/abilities' as Href))}
      onRetry={() => void detail.refetch()}
    />
  );
}
