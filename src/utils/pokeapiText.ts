import type { NamedAPIResource } from '@/types/pokeapi';
import { getPokeApiLanguages } from '@/i18n';

/** Filtro per le voci localizzate di PokéAPI (nomi, descrizioni, effetti). */
export const byLanguage = (language: string) => (entry: { language: NamedAPIResource }) =>
  entry.language.name.toLowerCase() === language.toLowerCase();

/** Le descrizioni arrivano con a capo, trattini di sillabazione e form feed dei giochi. */
export function cleanText(text: string): string {
  return text
    .replace(/[­]/g, '')
    .replace(/-\n(?=\p{Ll})/gu, '')
    .replace(/[\n\f\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Ultima descrizione dei giochi in quella lingua, saltando i segnaposto come «- - -». */
export function latestFlavor(
  entries: { text: string; language: NamedAPIResource }[],
  language: string,
): string | null {
  const texts = entries
    .filter(byLanguage(language))
    .map((entry) => cleanText(entry.text))
    .filter((text) => /\p{L}/u.test(text));
  return texts.at(-1) ?? null;
}

/**
 * Voce nella lingua in uso (nome, genere, effetto…), altrimenti in inglese; undefined se
 * non c'è nessuna delle due.
 */
export function localized<T extends { language: NamedAPIResource }>(entries: T[]): T | undefined {
  for (const language of getPokeApiLanguages()) {
    const entry = entries.find(byLanguage(language));
    if (entry) return entry;
  }
  return undefined;
}

/** Ultima descrizione dei giochi nella lingua in uso, altrimenti in inglese. */
export function latestLocalizedFlavor(entries: { text: string; language: NamedAPIResource }[]): string | null {
  for (const language of getPokeApiLanguages()) {
    const text = latestFlavor(entries, language);
    if (text) return text;
  }
  return null;
}
