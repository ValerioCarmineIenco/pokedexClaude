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

/** Mescola il colore del tipo col bianco: `amount` è la quota di colore (0–1). */
export function typeTint(type: TypeName, amount = 0.28): string {
  const n = parseInt(TYPE_COLORS[type].slice(1), 16);
  const mix = (c: number) => Math.round(c * amount + 255 * (1 - amount));
  return `rgb(${mix(n >> 16)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`;
}

export function primaryType(types: TypeName[]): TypeName {
  return types[0] ?? 'normal';
}
