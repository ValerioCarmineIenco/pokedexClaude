import { getPokemonSummaries } from '@/api/pokemon';
import { getEffectiveness, getStaticTypeMatchups } from '@/api/types';
import { TYPE_NAMES_IT } from '@/theme/typeNames';
import { TYPE_NAMES, type PokemonSummary, type TypeName } from '@/types/pokemon';
import { formatName } from '@/utils/format';

import { getDefenseMultipliers } from './typeEffectiveness';

/** I membri della squadra dall'indice locale, nell'ordine della squadra. */
export function getTeamMembers(ids: number[]): PokemonSummary[] {
  const byId = new Map(getPokemonSummaries(ids).map((pokemon) => [pokemon.id, pokemon]));
  return ids.flatMap((id) => byId.get(id) ?? []);
}

/** Quanti membri della squadra subiscono più o meno danno da un tipo attaccante. */
export type TeamTypeRow = {
  type: TypeName;
  /** Membri che subiscono ×2 o ×4. */
  weak: number;
  /** Membri che subiscono ×½, ×¼ o ×0. */
  resist: number;
};

export type TeamAnalysis = {
  /** Tipi a cui almeno 2 membri sono deboli, dal più pericoloso. */
  sharedWeaknesses: TeamTypeRow[];
  /** Tipi attaccanti a cui nessun membro resiste (né è immune). */
  unresisted: TypeName[];
  /** Tipi che nessun membro colpisce ×2 con le mosse dei propri tipi. */
  uncovered: TypeName[];
};

/**
 * Copertura di tipo della squadra, dalla tabella locale delle efficacie (nessuna chiamata di
 * rete). Le debolezze usano gli stessi calcoli della scheda (`getDefenseMultipliers`).
 */
export function analyzeTeam(members: PokemonSummary[]): TeamAnalysis {
  const multipliers = members.map((member) =>
    getDefenseMultipliers(member.types.map((type) => getStaticTypeMatchups(type))),
  );

  const rows: TeamTypeRow[] = TYPE_NAMES.map((type) => ({
    type,
    weak: multipliers.filter((byType) => byType[type] > 1).length,
    resist: multipliers.filter((byType) => byType[type] < 1).length,
  }));

  const attackingTypes = new Set(members.flatMap((member) => member.types));

  return {
    sharedWeaknesses: rows
      .filter((row) => row.weak >= 2)
      .sort((a, b) => b.weak - a.weak || a.resist - b.resist),
    unresisted: members.length > 0 ? rows.filter((row) => row.resist === 0).map((row) => row.type) : [],
    uncovered:
      members.length > 0
        ? TYPE_NAMES.filter(
            (defender) => ![...attackingTypes].some((attacker) => getEffectiveness(attacker, defender) > 1),
          )
        : [],
  };
}

/** Testo da condividere: il nome della squadra e poi un Pokémon per riga, con i tipi. */
export function formatTeamText(name: string, members: PokemonSummary[]): string {
  const lines = members.map(
    (member, index) =>
      `${index + 1}. ${formatName(member.name)} (${member.types.map((type) => TYPE_NAMES_IT[type]).join('/')})`,
  );
  return [name, ...lines].join('\n');
}
