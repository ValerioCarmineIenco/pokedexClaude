import { t } from '@/i18n';
import type { Generation } from '@/types/pokemon';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/** 2 → "II" */
export function romanNumeral(n: number): string {
  return ROMAN[n - 1] ?? String(n);
}

/** Etichetta corta per il selettore nella lingua in uso: "Gen II", "第2世代". */
export function shortGenerationLabel(generation: Generation): string {
  return t('pokedex:generation.short', { numeral: romanNumeral(generation.id), number: generation.id });
}

/** Quanti Pokémon ha la generazione. */
export function generationSize(generation: Generation): number {
  return generation.lastId - generation.firstId + 1;
}
