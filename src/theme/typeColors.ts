import { getActiveTheme, luminance, mixColors, tintColor } from './colors';
import type { TypeName } from '@/types/pokemon';

/** Colore pieno di ciascuno dei 18 tipi. */
export const TYPE_COLORS: Record<TypeName, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

const DARK_TEXT = '#1D1C22';
const LIGHT_TEXT = '#FFFFFF';

/** I tipi chiari usano testo scuro sull'etichetta, per restare leggibili. */
const LIGHT_TYPES = new Set<TypeName>([
  'normal',
  'electric',
  'grass',
  'ice',
  'ground',
  'bug',
  'rock',
  'steel',
]);

export function typeTextColor(type: TypeName): string {
  return LIGHT_TYPES.has(type) ? DARK_TEXT : LIGHT_TEXT;
}

/** Mescola il colore del tipo con la base del tema (bianco nei temi chiari): `amount` è la quota di colore (0–1). */
export function typeTint(type: TypeName, amount = 0.28): string {
  return tintColor(TYPE_COLORS[type], amount);
}

export function primaryType(types: TypeName[]): TypeName {
  return types[0] ?? 'normal';
}

/** Testo scuro delle carte sui tipi molto chiari (Elettro, Ghiaccio): il bianco non si leggerebbe. */
const CARD_DARK_TEXT = '#131317';
const CARD_LIGHT_TEXT = '#FFFFFF';

export type TypeCardColors = {
  /** Sfumatura della carta, dall'alto a sinistra al basso a destra. */
  gradient: readonly [string, string];
  /** Nome, numero ed etichette sopra la carta. */
  text: string;
  /** Fondo delle etichette dei tipi sopra la carta. */
  pill: string;
  /** Numero grande in filigrana. */
  watermark: string;
};

/**
 * Colori di una carta «Collezione» nel colore del tipo: pieno in alto a sinistra, che sfuma
 * verso il nero (temi scuri) o il bianco (temi chiari) in basso a destra.
 */
export function typeCardColors(type: TypeName): TypeCardColors {
  const { cardShade, cardShadeAmount } = getActiveTheme().palette;
  const base = TYPE_COLORS[type];
  const dark = luminance(base) > 0.55;
  return {
    gradient: [base, mixColors(base, cardShade, 1 - cardShadeAmount)],
    text: dark ? CARD_DARK_TEXT : CARD_LIGHT_TEXT,
    pill: dark ? 'rgba(19, 19, 23, 0.14)' : 'rgba(0, 0, 0, 0.2)',
    watermark: dark ? 'rgba(19, 19, 23, 0.1)' : 'rgba(255, 255, 255, 0.12)',
  };
}
