import * as SplashScreen from 'expo-splash-screen';
import { useEffect, type ReactNode } from 'react';

import { useAppFonts } from '@/theme/fonts';

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Tiene lo splash finché i caratteri non sono pronti (o non sono riusciti a caricarsi). */
export function FontsGate({ children }: { children: ReactNode }) {
  const [loaded, error] = useAppFonts();
  const ready = loaded || error != null;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  return ready ? children : null;
}
