import type { Generation } from '@/types/pokemon';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/** 2 → "II" */
export function romanNumeral(n: number): string {
  return ROMAN[n - 1] ?? String(n);
}

/** Etichetta corta per il selettore: "Gen II". */
export function shortGenerationLabel(generation: Generation): string {
  return `Gen ${romanNumeral(generation.id)}`;
}

/** Quanti Pokémon ha la generazione. */
export function generationSize(generation: Generation): number {
  return generation.lastId - generation.firstId + 1;
}
