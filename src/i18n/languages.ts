/** Lingue dell'interfaccia, nell'ordine del selettore delle Impostazioni. */
export const LANGUAGES = [
  { code: 'en', nativeName: 'English', locale: 'en-US' },
  { code: 'it', nativeName: 'Italiano', locale: 'it-IT' },
  { code: 'fr', nativeName: 'Français', locale: 'fr-FR' },
  { code: 'de', nativeName: 'Deutsch', locale: 'de-DE' },
  { code: 'es', nativeName: 'Español', locale: 'es-ES' },
  { code: 'ja', nativeName: '日本語', locale: 'ja-JP' },
] as const;

export type Language = (typeof LANGUAGES)[number]['code'];

/** Lingua usata quando quella del dispositivo non è tra le nostre, e per i dati che mancano. */
export const FALLBACK_LANGUAGE: Language = 'en';

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.some((language) => language.code === value);
}

/** Codici delle lingue di PokéAPI da provare per ogni lingua dell'app, l'inglese per ultimo. */
export const POKEAPI_LANGUAGES: Record<Language, readonly string[]> = {
  en: ['en'],
  it: ['it', 'en'],
  fr: ['fr', 'en'],
  de: ['de', 'en'],
  es: ['es', 'en'],
  // `ja` ha i kanji dei giochi recenti, `ja-Hrkt` solo i kana: c'è più spesso.
  ja: ['ja', 'ja-Hrkt', 'en'],
};
