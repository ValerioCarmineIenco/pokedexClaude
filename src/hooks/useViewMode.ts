import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export type ViewMode = 'grid' | 'row';

const DEFAULT_STORAGE_KEY = 'pokedex.viewMode';

/**
 * Vista dell'elenco (griglia o riga), ricordata tra un'apertura e l'altra. Predefinita: griglia.
 * Ogni elenco passa la sua chiave, così Pokédex e Oggetti ricordano viste diverse.
 */
export function useViewMode(storageKey: string = DEFAULT_STORAGE_KEY) {
  const [viewMode, setViewModeState] = useState<ViewMode>('grid');

  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((saved) => {
        if (saved === 'grid' || saved === 'row') setViewModeState(saved);
      })
      .catch(() => {});
  }, [storageKey]);

  const setViewMode = useCallback(
    (mode: ViewMode) => {
      setViewModeState(mode);
      AsyncStorage.setItem(storageKey, mode).catch(() => {});
    },
    [storageKey],
  );

  return [viewMode, setViewMode] as const;
}
