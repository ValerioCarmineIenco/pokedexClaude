import { MOCK_ABILITY_DETAILS } from '@/data/mockAbilityDetails';

/** Id di rotta → numero positivo, altrimenti null. */
function parseAbilityId(value: string | string[] | number | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * Abilità e Pokémon che la possono avere, per la schermata di dettaglio.
 * Uso: `useAbilityDetail(useLocalSearchParams<{ abilityId: string }>().abilityId)`.
 * Per ora legge dati finti (`MOCK_ABILITY_DETAILS`): ha già la forma che userà PokéAPI.
 */
export function useAbilityDetail(idParam: string | string[] | number | undefined) {
  const id = parseAbilityId(idParam);
  const ability = id === null ? undefined : MOCK_ABILITY_DETAILS.find((a) => a.id === id);

  return {
    id,
    ability,
    isLoading: false,
    /** L'id non è tra le abilità dell'app. */
    isInvalidId: ability === undefined,
    errorMessage: null as string | null,
    refetch: () => {},
  };
}
