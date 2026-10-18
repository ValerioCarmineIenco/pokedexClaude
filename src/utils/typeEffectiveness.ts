import { TYPE_NAMES_IT } from '@/theme/typeNames';
import type { MatchupType, TypeMatchups } from '@/types/move';
import { TYPE_NAMES, type TypeName } from '@/types/pokemon';

/** Moltiplicatori difensivi possibili con uno o due tipi, dal peggiore al migliore. */
export const DEFENSE_MULTIPLIERS = [4, 2, 0.5, 0.25, 0] as const;
export type DefenseMultiplier = (typeof DEFENSE_MULTIPLIERS)[number];

/** Un gruppo di tipi attaccanti che infliggono lo stesso moltiplicatore. */
export type DefenseGroup = {
  multiplier: DefenseMultiplier;
  types: MatchupType[];
};

/**
 * Danno subito da ciascun tipo attaccante: il prodotto dei moltiplicatori dei tipi del
 * Pokémon (Fuoco/Volante: Roccia ×2 × ×2 = ×4, Terra ×1 × ×0 = ×0).
 */
export function getDefenseMultipliers(matchups: TypeMatchups[]): Record<TypeName, number> {
  const result = Object.fromEntries(TYPE_NAMES.map((type) => [type, 1])) as Record<TypeName, number>;
  for (const { defense } of matchups) {
    for (const { type } of defense.weakTo) result[type] *= 2;
    for (const { type } of defense.resists) result[type] *= 0.5;
    for (const { type } of defense.immuneTo) result[type] = 0;
  }
  return result;
}

/** I tipi attaccanti raggruppati per moltiplicatore (×1 escluso), in ordine di tipo. */
export function getDefenseGroups(matchups: TypeMatchups[]): DefenseGroup[] {
  const multipliers = getDefenseMultipliers(matchups);
  return DEFENSE_MULTIPLIERS.map((multiplier) => ({
    multiplier,
    types: TYPE_NAMES.filter((type) => multipliers[type] === multiplier).map((type) => ({
      type,
      label: TYPE_NAMES_IT[type],
    })),
  }));
}

const MULTIPLIER_LABELS: Record<DefenseMultiplier, string> = {
  4: '×4',
  2: '×2',
  0.5: '×½',
  0.25: '×¼',
  0: '×0',
};

export const formatMultiplier = (multiplier: DefenseMultiplier) => MULTIPLIER_LABELS[multiplier];
