import { getLocale, labelMap, t } from '@/i18n';
import type { StatName } from '@/types/pokemon';

/** 25 → "#025" */
export function formatNumber(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

// Nomi di PokéAPI che non si sistemano con la sola maiuscola.
const SPECIAL_NAMES: Record<string, string> = {
  'nidoran-f': 'Nidoran♀',
  'nidoran-m': 'Nidoran♂',
  'mr-mime': 'Mr. Mime',
  farfetchd: "Farfetch'd",
};

/** Slug di PokéAPI → nome leggibile: "charizard" → "Charizard", "solar-power" → "Solar Power". */
export function formatName(slug: string): string {
  if (SPECIAL_NAMES[slug]) return SPECIAL_NAMES[slug];
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const decimal = (value: number) =>
  value.toLocaleString(getLocale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Numero intero con i separatori della lingua in uso: 1500 → "1.500" / "1,500". */
export const formatInteger = (value: number) => value.toLocaleString(getLocale());

/** Decimetri → "1,7 m" */
export function formatHeight(decimetres: number): string {
  return `${decimal(decimetres / 10)} m`;
}

/** Ettogrammi → "90,5 kg" */
export function formatWeight(hectograms: number): string {
  return `${decimal(hectograms / 10)} kg`;
}

/** Nomi brevi delle statistiche (PS, Att. Sp.…) nella lingua in uso. */
export const STAT_LABELS: Record<StatName, string> = labelMap(
  ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'],
  (stat) => t(`common:stats.${stat}`),
);

/** Le statistiche base non superano mai 255. */
export const MAX_STAT = 255;
