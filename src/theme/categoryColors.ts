import { tintColor } from './colors';
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
  /** Nome della categoria nella lingua in uso (`ITEM_CATEGORY_LABELS`). */
  label: string;
};


/** Tutte le tonalità di una categoria. Categorie sconosciute ricadono su "other". */
export function getCategoryColors(category: ItemCategory): CategoryColors {
  const key = category in CATEGORY_COLORS ? category : 'other';
  const color = CATEGORY_COLORS[key];
  return {
    color,
    text: LIGHT_CATEGORIES.has(key) ? DARK_TEXT : LIGHT_TEXT,
    tint: tintColor(color, 0.42),
    soft: tintColor(color, 0.16),
    label: ITEM_CATEGORY_LABELS[key],
  };
}
