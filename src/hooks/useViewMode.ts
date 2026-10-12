import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export type ViewMode = 'grid' | 'row';

const STORAGE_KEY = 'pokedex.viewMode';

/** Vista dell'elenco (griglia o riga), ricordata tra un'apertura e l'altra. Predefinita: griglia. */
export function useViewMode() {
  const [viewMode, setViewModeState] = useState<ViewMode>('grid');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'grid' || saved === 'row') setViewModeState(saved);
      })
      .catch(() => {});
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
  }, []);

  return [viewMode, setViewMode] as const;
}
