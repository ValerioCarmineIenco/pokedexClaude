import { Fragment, type ReactNode } from 'react';

import { useLanguage, useLanguageLoaded } from '@/i18n';

/**
 * Aspetta la lingua salvata nelle Impostazioni, poi rimonta le schermate a ogni cambio di
 * lingua: testi, nomi dagli indici e chiavi delle query si ricalcolano tutti. La navigazione
 * resta dov'era (lo stato lo tiene il contenitore di Expo Router).
 */
export function LanguageGate({ children }: { children: ReactNode }) {
  const loaded = useLanguageLoaded();
  const language = useLanguage();
  if (!loaded) return null;
  return <Fragment key={language}>{children}</Fragment>;
}
