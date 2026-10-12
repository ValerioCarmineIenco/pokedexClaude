import { ITEM_CATEGORY_LABELS, type ItemCategory } from '@/types/item';

/** Colore pieno di ciascuna categoria di oggetti, nello stesso spirito dei colori per tipo. */
export const CATEGORY_COLORS: Record<ItemCategory, string> = {
  remedies: '#3FB27F',
  tm: '#2B72D0',
  megaStones: '#9B5DE5',
  pokeballs: '#E3350D',
  battle: '#F08A24',
  berries: '#C93A78',
  evolution: '#F2C230',
  other: '#77737F',
};

const DARK_TEXT = '#1D1C22';
const LIGHT_TEXT = '#FFFFFF';

/** Le categorie chiare usano testo scuro sull'etichetta, per restare leggibili. */
const LIGHT_CATEGORIES = new Set<ItemCategory>(['remedies', 'battle', 'evolution']);

export type CategoryColors = {
  /** Colore pieno: etichette, accenti. */
  color: string;
  /** Testo leggibile sopra `color`. */
  text: string;
  /** Sfondo dell'intestazione del dettaglio. */
  tint: string;
  /** Sfondo tenue di carte e riquadri. */
  soft: string;
  /** Nome italiano della categoria (`ITEM_CATEGORY_LABELS`). */
  label: string;
};

/** Mescola un colore esadecimale col bianco: `amount` è la quota di colore (0–1). */
function mixWithWhite(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c * amount + 255 * (1 - amount));
  return `rgb(${mix(n >> 16)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`;
}

/** Tutte le tonalità di una categoria. Categorie sconosciute ricadono su "other". */
export function getCategoryColors(category: ItemCategory): CategoryColors {
  const key = category in CATEGORY_COLORS ? category : 'other';
  const color = CATEGORY_COLORS[key];
  return {
    color,
    text: LIGHT_CATEGORIES.has(key) ? DARK_TEXT : LIGHT_TEXT,
    tint: mixWithWhite(color, 0.42),
    soft: mixWithWhite(color, 0.16),
    label: ITEM_CATEGORY_LABELS[key],
  };
}
