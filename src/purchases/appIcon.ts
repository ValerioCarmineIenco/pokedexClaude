import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { ImageSourcePropType } from 'react-native';
import { useSyncExternalStore } from 'react';

/**
 * Icone dell'app (2.0). Le immagini e i nomi nativi sono dichiarati nel plugin
 * `expo-alternate-app-icons` in `app.json`; le genera `scripts/generate-app-icons.mjs`.
 *
 * Il cambio vero dell'icona sulla schermata Home serve una development build (o la build
 * dello store): in Expo Go e sul web la scelta si salva e si vede nelle Impostazioni, ma
 * l'icona del telefono non cambia (`ALTERNATE_ICONS_SUPPORTED` è `false`).
 */

export type AppIconId = 'collection' | 'classic' | 'night' | 'shinyGold' | 'retro' | 'spectre' | 'device';

/**
 * Cosa serve per usare un'icona: niente, il Pacchetto stile (o Pro), oppure il tema
 * Dispositivo, che si compra a parte e non è incluso in Pro.
 */
export type AppIconAccess = 'free' | 'styles' | 'deviceTheme';

export type AppIcon = {
  id: AppIconId;
  /** Nome dell'icona alternativa nel progetto nativo; `null` per quella predefinita. */
  nativeName: string | null;
  access: AppIconAccess;
  preview: ImageSourcePropType;
};

export const APP_ICONS: AppIcon[] = [
  {
    id: 'collection',
    nativeName: null,
    access: 'free',
    preview: require('../../assets/images/app-icons/collection-preview.png'),
  },
  {
    id: 'classic',
    nativeName: 'Classic',
    access: 'free',
    preview: require('../../assets/images/app-icons/classic-preview.png'),
  },
  {
    id: 'night',
    nativeName: 'Night',
    access: 'free',
    preview: require('../../assets/images/app-icons/night-preview.png'),
  },
  {
    id: 'shinyGold',
    nativeName: 'ShinyGold',
    access: 'styles',
    preview: require('../../assets/images/app-icons/shinyGold-preview.png'),
  },
  {
    id: 'retro',
    nativeName: 'Retro',
    access: 'styles',
    preview: require('../../assets/images/app-icons/retro-preview.png'),
  },
  {
    id: 'spectre',
    nativeName: 'Spectre',
    access: 'styles',
    preview: require('../../assets/images/app-icons/spectre-preview.png'),
  },
  {
    id: 'device',
    nativeName: 'Device',
    access: 'deviceTheme',
    preview: require('../../assets/images/app-icons/device-preview.png'),
  },
];

const DEFAULT_ICON: AppIconId = 'collection';

/** Id salvati dalla scelta simulata della PR 50, prima delle icone definitive. */
const LEGACY_IDS: Record<string, AppIconId> = { default: 'collection', gold: 'shinyGold' };

type IconsModule = typeof import('expo-alternate-app-icons');

/**
 * Il modulo nativo, o `null` dove non c'è: Expo Go non lo include e importarlo lì farebbe
 * crashare l'app; sul web il pacchetto ha una versione finta che non cambia nulla.
 */
const iconsModule: IconsModule | null = (() => {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-alternate-app-icons') as IconsModule;
  } catch {
    return null;
  }
})();

/** `true` se il telefono può davvero cambiare l'icona sulla schermata Home. */
export const ALTERNATE_ICONS_SUPPORTED = iconsModule?.supportsAlternateIcons ?? false;

const STORAGE_KEY = 'pokedex.appIcon';

let current: AppIconId = DEFAULT_ICON;
const listeners = new Set<() => void>();

function emit(value: AppIconId) {
  current = value;
  listeners.forEach((listener) => listener());
}

const findIcon = (id: AppIconId) => APP_ICONS.find((icon) => icon.id === id);

function parseId(value: string | null): AppIconId | null {
  if (!value) return null;
  if (value in LEGACY_IDS) return LEGACY_IDS[value];
  return APP_ICONS.some((icon) => icon.id === value) ? (value as AppIconId) : null;
}

/** L'icona attiva sul telefono, letta dal sistema: vince sulla scelta salvata. */
function nativeIconId(): AppIconId | null {
  if (!ALTERNATE_ICONS_SUPPORTED || !iconsModule) return null;
  try {
    const name = iconsModule.getAppIconName();
    return APP_ICONS.find((icon) => icon.nativeName === name)?.id ?? DEFAULT_ICON;
  } catch {
    return null;
  }
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((saved) => {
    const id = nativeIconId() ?? parseId(saved);
    if (id) emit(id);
  })
  .catch(() => {});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => current;

/**
 * Cambia l'icona dell'app. Su iOS il sistema mostra un avviso dopo il cambio. Se il cambio
 * nativo fallisce, la scelta precedente resta e l'errore risale a chi chiama.
 */
export async function setAppIcon(id: AppIconId) {
  const icon = findIcon(id);
  if (!icon) return;
  if (ALTERNATE_ICONS_SUPPORTED && iconsModule) {
    await iconsModule.setAlternateAppIcon(icon.nativeName);
  }
  emit(id);
  await AsyncStorage.setItem(STORAGE_KEY, id).catch(() => {});
}

export function useAppIcon() {
  const id = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return [id, setAppIcon] as const;
}
