import { StatusBar } from 'expo-status-bar';
import { Fragment, type ReactNode } from 'react';

import { setActiveTheme } from '@/theme/colors';
import { useResolvedTheme } from '@/theme/themeStore';

/**
 * Aspetta tema e acquisti salvati, poi rimonta tutto a ogni cambio di tema (come
 * `LanguageGate` per la lingua): `colors` e gli stili di `themedStyles` si ricalcolano.
 */
export function ThemeGate({ children }: { children: ReactNode }) {
  const { theme, loaded } = useResolvedTheme();
  if (!loaded) return null;
  // Va fatto prima che i figli si disegnino, non in un effetto.
  setActiveTheme(theme);
  return (
    <Fragment key={theme.id}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      {children}
    </Fragment>
  );
}
