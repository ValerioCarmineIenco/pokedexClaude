import { getGenerationOfPokemon, LAST_POKEMON_ID } from '@/api/generations';
import { getMoves } from '@/api/moves';
import { getArtworkUrl } from '@/api/pokemon';
import typeIndex from '@/data/typeIndex.json';
import { TYPE_LABELS } from '@/theme/typeNames';
import type { MatchupType, MoveSummary, TypeMatchups } from '@/types/move';
import { TYPE_NAMES, type PokemonSummary, type TypeName } from '@/types/pokemon';

/**
 * Tabella delle efficacie e tipi di ogni Pokémon, dall'indice locale: la sezione Tipi non
 * fa chiamate di rete. Generato da `scripts/generate-type-index.mjs`.
 */
type TypeIndex = {
  /** chart[attaccante][difensore], solo i moltiplicatori diversi da ×1. */
  chart: Record<TypeName, Partial<Record<TypeName, number>>>;
  pokemon: { id: number; name: string; types: TypeName[] }[];
};

const INDEX = typeIndex as TypeIndex;

/** Moltiplicatore di una mossa di tipo `attacker` contro un Pokémon di tipo `defender`. */
export function getEffectiveness(attacker: TypeName, defender: TypeName): number {
  return INDEX.chart[attacker][defender] ?? 1;
}

function isTypeName(value: unknown): value is TypeName {
  return typeof value === 'string' && (TYPE_NAMES as readonly string[]).includes(value);
}

/** Converte il parametro di rotta (`"dragon"`) in un tipo, altrimenti null. */
export function parseTypeName(value: string | string[] | undefined): TypeName | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return isTypeName(raw) ? raw : null;
}

const toMatchupTypes = (types: TypeName[]): MatchupType[] =>
  types.map((type) => ({ type, label: TYPE_LABELS[type] }));

/**
 * Efficacia di un tipo nella stessa forma di `getTypeMatchups`, ma dall'indice locale: così
 * vale anche `getDefenseGroups` di `utils/typeEffectiveness`.
 */
export function getStaticTypeMatchups(type: TypeName): TypeMatchups {
  const attackers = (multiplier: number) =>
    toMatchupTypes(TYPE_NAMES.filter((other) => getEffectiveness(other, type) === multiplier));
  const targets = (multiplier: number) =>
    toMatchupTypes(TYPE_NAMES.filter((other) => getEffectiveness(type, other) === multiplier));
  return {
    type,
    attack: {
      superEffective: targets(2),
      notVeryEffective: targets(0.5),
      noEffect: targets(0),
      normal: targets(1),
    },
    defense: {
      weakTo: attackers(2),
      resists: attackers(0.5),
      immuneTo: attackers(0),
    },
  };
}

const POKEMON = INDEX.pokemon
  .filter((entry) => entry.id <= LAST_POKEMON_ID)
  .map(
    (entry): PokemonSummary => ({
      id: entry.id,
      generation: getGenerationOfPokemon(entry.id),
      name: entry.name,
      types: entry.types,
      artworkUrl: getArtworkUrl(entry.id),
    }),
  );

/** Pokémon che hanno `type` come primo o secondo tipo, in ordine di numero. */
export function getPokemonOfType(type: TypeName): PokemonSummary[] {
  return POKEMON.filter((pokemon) => pokemon.types.includes(type));
}

/** Mosse di questo tipo, in ordine di id (dall'indice delle mosse). */
export function getMovesOfType(type: TypeName): MoveSummary[] {
  return getMoves().filter((move) => move.type === type);
}
