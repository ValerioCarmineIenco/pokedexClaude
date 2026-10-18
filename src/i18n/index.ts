import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import { useSyncExternalStore } from 'react';

import { FALLBACK_LANGUAGE, isLanguage, LANGUAGES, POKEAPI_LANGUAGES, type Language } from './languages';
import { resources } from './resources';

export { LANGUAGES, type Language } from './languages';

/** Scelta delle Impostazioni: una lingua, oppure quella del dispositivo. */
export type LanguagePreference = Language | 'system';

const STORAGE_KEY = 'pokedex.language';

/** Prima lingua del dispositivo che l'app conosce, altrimenti l'inglese. */
export function getDeviceLanguage(): Language {
  for (const locale of getLocales()) {
    if (isLanguage(locale.languageCode)) return locale.languageCode;
  }
  return FALLBACK_LANGUAGE;
}

// Istanza propria (non quella globale di i18next): react-i18next la riceve da `use`.
const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: FALLBACK_LANGUAGE,
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  // Le risorse sono nel bundle: niente caricamento asincrono né Suspense.
  initAsync: false,
  react: { useSuspense: false },
});

// Sul web la pagina dichiara la lingua in uso (lettori di schermo, sillabazione).
i18n.on('languageChanged', (language) => {
  if (typeof document !== 'undefined') document.documentElement.lang = language;
});

export { i18n };

/** Scorciatoia per il codice fuori dai componenti (api, utils): `t('common:back')`. */
export const t = i18n.t.bind(i18n);

/** Lingua dell'interfaccia in uso. */
export function getLanguage(): Language {
  return isLanguage(i18n.language) ? i18n.language : FALLBACK_LANGUAGE;
}

/** Locale per numeri e ordinamenti (`toLocaleString`, `localeCompare`). */
export function getLocale(): string {
  return LANGUAGES.find((language) => language.code === getLanguage())!.locale;
}

/** Lingue di PokéAPI da provare per nomi e descrizioni, l'inglese per ultimo. */
export function getPokeApiLanguages(): readonly string[] {
  return POKEAPI_LANGUAGES[getLanguage()];
}

/**
 * Valore calcolato una volta per lingua: per gli elenchi costruiti dagli indici locali
 * (nomi, testo di ricerca), che altrimenti resterebbero nella lingua dell'avvio.
 */
export function perLanguage<T>(compute: () => T): () => T {
  let cached: { language: Language; value: T } | null = null;
  return () => {
    const language = getLanguage();
    if (cached?.language !== language) cached = { language, value: compute() };
    return cached.value;
  };
}

// Preferenza salvata, come lo stile dell'artwork: un valore in memoria letto da disco all'avvio.
let preference: LanguagePreference = 'system';
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function apply(next: LanguagePreference) {
  preference = next;
  const language = next === 'system' ? getDeviceLanguage() : next;
  if (language !== i18n.language) i18n.changeLanguage(language);
}

// Nel rendering statico del sito (Node, senza `window`) la preferenza non si legge: la pagina
// esce senza schermate e il browser le disegna nella lingua giusta, senza differenze di idratazione.
if (typeof window !== 'undefined') {
  AsyncStorage.getItem(STORAGE_KEY)
    .then((saved) => {
      if (isLanguage(saved)) apply(saved);
    })
    .catch(() => {})
    .finally(() => {
      loaded = true;
      emit();
    });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setLanguagePreference(next: LanguagePreference) {
  apply(next);
  emit();
  const saved = next === 'system' ? AsyncStorage.removeItem(STORAGE_KEY) : AsyncStorage.setItem(STORAGE_KEY, next);
  saved.catch(() => {});
}

/** Lingua scelta nelle Impostazioni («system» = quella del dispositivo), ricordata tra un'apertura e l'altra. */
export function useLanguagePreference() {
  const value = useSyncExternalStore(subscribe, () => preference, () => preference);
  return [value, setLanguagePreference] as const;
}

/** False finché la preferenza salvata non è stata letta: l'app aspetta per non cambiare lingua sotto gli occhi. */
export function useLanguageLoaded() {
  return useSyncExternalStore(subscribe, () => loaded, () => false);
}

/** Lingua in uso; il componente si aggiorna quando cambia. */
export function useLanguage(): Language {
  const { i18n: instance } = useTranslation();
  return isLanguage(instance.language) ? instance.language : FALLBACK_LANGUAGE;
}

/**
 * Oggetto `{ chiave: etichetta }` che legge l'etichetta nella lingua in uso a ogni accesso:
 * le tabelle di etichette dei moduli restano `TABELLA[chiave]` senza fermarsi alla lingua
 * dell'avvio.
 */
export function labelMap<K extends string>(keys: readonly K[], label: (key: K) => string): Record<K, string> {
  const map = {} as Record<K, string>;
  for (const key of keys) {
    Object.defineProperty(map, key, { get: () => label(key), enumerable: true });
  }
  return map;
}
