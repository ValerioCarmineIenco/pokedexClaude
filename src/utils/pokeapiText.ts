import type { NamedAPIResource } from '@/types/pokeapi';

/** Filtro per le voci localizzate di PokéAPI (nomi, descrizioni, effetti). */
export const byLanguage = (language: string) => (entry: { language: NamedAPIResource }) =>
  entry.language.name === language;

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
