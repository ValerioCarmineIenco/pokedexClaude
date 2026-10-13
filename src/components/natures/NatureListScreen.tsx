import { useNatureSearch } from '@/hooks/useNatureSearch';
import { useNatures } from '@/hooks/useNatures';

import { NatureListView } from './NatureListView';

/** Schermata elenco nature, pronta da montare in una rotta. */
export function NatureListScreen() {
  const search = useNatureSearch();
  const list = useNatures(search.query);

  return (
    <NatureListView
      natures={list.natures}
      totalCount={list.total}
      searchText={search.text}
      onSearchTextChange={search.setText}
      isLoading={list.isLoading}
      errorMessage={list.errorMessage}
      isRefreshing={list.isRefreshing}
      onRefresh={() => list.refetch()}
      onRetry={() => list.refetch()}
    />
  );
}
