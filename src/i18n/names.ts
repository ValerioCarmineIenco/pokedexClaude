import de from '@/data/names/de.json';
import en from '@/data/names/en.json';
import es from '@/data/names/es.json';
import fr from '@/data/names/fr.json';
import it from '@/data/names/it.json';
import ja from '@/data/names/ja.json';
import { formatName } from '@/utils/format';

import { getLanguage } from './index';
import type { Language } from './languages';

/**
 * Nomi localizzati di PokéAPI per gli elenchi che vengono dagli indici locali.
 * Generati da `scripts/generate-names.mjs`.
 */
type NameTable = Record<string, Record<string, string>>;
const NAMES: Record<Language, NameTable> = { en, it, fr, de, es, ja };

export type NameKind = keyof typeof en;

/**
 * Nome di un Pokémon, una mossa, un tipo… nella lingua in uso: chiave = id (o slug per tipi e
 * statistiche). Se manca ripiega sull'inglese, poi su `fallback`, poi sullo slug leggibile.
 */
export function localName(kind: NameKind, key: number | string, fallback?: string): string {
  return (
    NAMES[getLanguage()][kind]?.[key] ??
    NAMES.en[kind]?.[key] ??
    fallback ??
    (typeof key === 'string' ? formatName(key) : String(key))
  );
}

/** Nome di un Pokémon dal suo id nazionale. */
export const pokemonName = (id: number, slug?: string) => localName('pokemon', id, slug && formatName(slug));
