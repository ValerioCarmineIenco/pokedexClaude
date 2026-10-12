import { router } from 'expo-router';

import { useAbilitiesMock } from '@/data/abilitiesMock';
import { useItemSearch } from '@/hooks/useItemSearch';
import { useViewMode } from '@/hooks/useViewMode';

import { AbilityListView } from './AbilityListView';

/** Schermata elenco abilità, pronta da montare in una rotta. */
export function AbilityListScreen() {
  // Stesso debounce della ricerca degli oggetti.
  const search = useItemSearch();
  const list = useAbilitiesMock(search.query);
  const [viewMode, setViewMode] = useViewMode('pokedex.abilities.viewMode');

  return (
    <AbilityListView
      abilities={list.abilities}
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
      onPressAbility={(ability) =>
        router.push({ pathname: '/abilities/[abilityId]', params: { abilityId: String(ability.id) } })
      }
    />
  );
}
