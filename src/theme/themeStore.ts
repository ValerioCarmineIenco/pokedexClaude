import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { useColorScheme } from 'react-native';

import { useEntitlements } from '@/purchases/store';

import { getTheme, isThemeId, type Theme, type ThemeId } from './themes';

/** Tema scelto nelle Impostazioni: uno dei sei, oppure «system» (Classico o Notte, come il telefono). */
export type ThemePreference = ThemeId | 'system';

const STORAGE_KEY = 'pokedex.theme';

type State = { loaded: boolean; preference: ThemePreference };

let state: State = { loaded: false, preference: 'classic' };
const listeners = new Set<() => void>();

function emit(next: State) {
  state = next;
  listeners.forEach((listener) => listener());
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((saved) => {
    const preference = saved === 'system' || isThemeId(saved) ? saved : state.preference;
    emit({ loaded: true, preference });
  })
  .catch(() => emit({ ...state, loaded: true }));

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;

export function setThemePreference(preference: ThemePreference) {
  emit({ ...state, preference });
  AsyncStorage.setItem(STORAGE_KEY, preference).catch(() => {});
}

export function useThemePreference() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return [current.preference, setThemePreference, current.loaded] as const;
}

/**
 * Il tema da usare adesso: la scelta salvata, risolta col tema del telefono se «system».
 * Un tema premium senza Pacchetto stile ricade su Classico (es. dopo un rimborso).
 */
export function useResolvedTheme(): { theme: Theme; loaded: boolean } {
  const [preference, , loaded] = useThemePreference();
  const scheme = useColorScheme();
  const entitlements = useEntitlements();
  const id: ThemeId = preference === 'system' ? (scheme === 'dark' ? 'night' : 'classic') : preference;
  const theme = getTheme(id);
  const allowed = !theme.premium || entitlements.has('styles');
  return { theme: allowed ? theme : getTheme('classic'), loaded: loaded && entitlements.loaded };
}
