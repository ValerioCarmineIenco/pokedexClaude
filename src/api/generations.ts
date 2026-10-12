import type { Generation } from '@/types/pokemon';

/** Generazioni coperte dal Pokédex, in ordine. Gli intervalli sono gli id nazionali. */
export const GENERATIONS: readonly Generation[] = [
  { id: 1, name: 'Generazione I', region: 'Kanto', firstId: 1, lastId: 151 },
  { id: 2, name: 'Generazione II', region: 'Johto', firstId: 152, lastId: 251 },
  { id: 3, name: 'Generazione III', region: 'Hoenn', firstId: 252, lastId: 386 },
];

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
