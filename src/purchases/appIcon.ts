import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

/**
 * Icone alternative dell'app (Pacchetto stile). **Per ora simulate**: la scelta si salva e si
 * vede nelle Impostazioni, ma l'icona sulla schermata Home non cambia.
 *
 * Per quelle vere: `npx expo install expo-alternate-app-icons`, le immagini delle icone nel
 * plugin in `app.json`, e in `setAppIcon` la chiamata `setAlternateAppIcon(id)` (con `null` per
 * l'icona predefinita).
 */

export type AppIconId = 'default' | 'gold' | 'retro' | 'spectre';

export type AppIcon = {
  id: AppIconId;
  premium: boolean;
  /** Colori della Poké Ball disegnata nell'anteprima: sfondo, metà superiore, bordo e centro. */
  background: string;
  top: string;
  bottom: string;
  ink: string;
};

export const APP_ICONS: AppIcon[] = [
  { id: 'default', premium: false, background: '#E3350D', top: '#E3350D', bottom: '#FFFFFF', ink: '#1D1C22' },
  { id: 'gold', premium: true, background: '#211C13', top: '#E8B830', bottom: '#F8F0DA', ink: '#15120C' },
  { id: 'retro', premium: true, background: '#CDD8A6', top: '#3E6B1F', bottom: '#E2EAC4', ink: '#1C2F10' },
  { id: 'spectre', premium: true, background: '#120D1D', top: '#E64FD1', bottom: '#2C2245', ink: '#F2EBFF' },
];

const STORAGE_KEY = 'pokedex.appIcon';

let current: AppIconId = 'default';
const listeners = new Set<() => void>();

function emit(value: AppIconId) {
  current = value;
  listeners.forEach((listener) => listener());
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((saved) => {
    if (APP_ICONS.some((icon) => icon.id === saved)) emit(saved as AppIconId);
  })
  .catch(() => {});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => current;

export async function setAppIcon(id: AppIconId) {
  emit(id);
  await AsyncStorage.setItem(STORAGE_KEY, id).catch(() => {});
}

export function useAppIcon() {
  const id = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return [id, setAppIcon] as const;
}
