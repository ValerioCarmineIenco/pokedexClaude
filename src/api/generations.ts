import { t } from '@/i18n';
import { localName } from '@/i18n/names';
import type { Generation } from '@/types/pokemon';

/** Generazioni coperte dal Pokédex, in ordine. Gli intervalli sono gli id nazionali. */
const RANGES = [
  { id: 1, regionId: 1, firstId: 1, lastId: 151 },
  { id: 2, regionId: 2, firstId: 152, lastId: 251 },
  { id: 3, regionId: 3, firstId: 252, lastId: 386 },
  { id: 4, regionId: 4, firstId: 387, lastId: 493 },
  { id: 5, regionId: 5, firstId: 494, lastId: 649 },
  { id: 6, regionId: 6, firstId: 650, lastId: 721 },
  { id: 7, regionId: 7, firstId: 722, lastId: 809 },
  { id: 8, regionId: 8, firstId: 810, lastId: 905 },
  { id: 9, regionId: 10, firstId: 906, lastId: 1025 },
];

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

// Nome e regione si leggono nella lingua in uso a ogni accesso.
export const GENERATIONS: readonly Generation[] = RANGES.map(({ id, regionId, firstId, lastId }) => ({
  id,
  get name() {
    return t('common:generation', { number: ROMAN[id - 1], index: id });
  },
  get region() {
    return localName('region', regionId);
  },
  firstId,
  lastId,
}));

export const FIRST_POKEMON_ID = GENERATIONS[0].firstId;
export const LAST_POKEMON_ID = GENERATIONS[GENERATIONS.length - 1].lastId;

/** Generazione per id (`1`, `2`), undefined se non coperta. */
export function getGenerationById(id: number): Generation | undefined {
  return GENERATIONS.find((g) => g.id === id);
}

/** Numero della generazione a cui appartiene un Pokémon, dal suo id nazionale. */
export function getGenerationOfPokemon(pokemonId: number): number {
  const generation = GENERATIONS.find((g) => pokemonId >= g.firstId && pokemonId <= g.lastId);
  if (!generation) throw new Error(`Pokémon fuori dalle generazioni coperte: ${pokemonId}`);
  return generation.id;
}

/** Intervallo di id da mostrare: una generazione, oppure tutte in sequenza se `generationId` è null. */
export function getPokemonRange(generationId?: number | null): { firstId: number; lastId: number } {
  if (generationId == null) return { firstId: FIRST_POKEMON_ID, lastId: LAST_POKEMON_ID };
  const generation = getGenerationById(generationId);
  if (!generation) throw new Error(`Generazione non coperta: ${generationId}`);
  return { firstId: generation.firstId, lastId: generation.lastId };
}
