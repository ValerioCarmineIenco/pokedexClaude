import type { PokemonType } from '@/types/pokemon';

/** Nomi italiani dei 18 tipi. */
export const TYPE_NAMES: Record<PokemonType, string> = {
  normal: 'Normale',
  fire: 'Fuoco',
  water: 'Acqua',
  grass: 'Erba',
  electric: 'Elettro',
  ice: 'Ghiaccio',
  fighting: 'Lotta',
  poison: 'Veleno',
  ground: 'Terra',
  flying: 'Volante',
  psychic: 'Psico',
  bug: 'Coleottero',
  rock: 'Roccia',
  ghost: 'Spettro',
  dragon: 'Drago',
  dark: 'Buio',
  steel: 'Acciaio',
  fairy: 'Folletto',
};

export function getTypeName(type: PokemonType): string {
  return TYPE_NAMES[type];
}
