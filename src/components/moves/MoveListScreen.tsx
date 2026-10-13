import { router } from 'expo-router';

import { useMoves } from '@/hooks/useMoves';
import { useMoveSearch } from '@/hooks/useMoveSearch';
import { useViewMode } from '@/hooks/useViewMode';

import { MoveListView } from './MoveListView';

/** Schermata elenco mosse, pronta da montare in una rotta. */
export function MoveListScreen() {
  const search = useMoveSearch();
  const list = useMoves(search.query);
  const [viewMode, setViewMode] = useViewMode('pokedex.moves.viewMode');

  return (
    <MoveListView
      moves={list.moves}
      totalCount={list.total}
      searchText={search.text}
      onSearchTextChange={search.setText}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      onPressMove={(move) =>
        router.push({ pathname: '/moves/[moveId]', params: { moveId: String(move.id) } })
      }
    />
  );
}
