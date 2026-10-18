import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CompareView } from '@/components/compare/CompareView';
import { PokemonPicker } from '@/components/compare/PokemonPicker';
import { usePokemon } from '@/hooks/usePokemon';
import { usePokemonTypeDefense } from '@/hooks/usePokemonTypeDefense';
import { pokemonName } from '@/i18n/names';

const SLOTS = ['a', 'b'] as const;

/**
 * Confronto tra due Pokémon: `/compare?a=6&b=9`. Gli id restano nell'URL, così il link
 * riapre lo stesso confronto. Senza uno dei due id si parte dalla scelta del Pokémon.
 */
export default function CompareScreen() {
  const { t } = useTranslation('compare');
  const params = useLocalSearchParams<{ a?: string; b?: string }>();
  const first = usePokemon(params.a);
  const second = usePokemon(params.b);
  const firstDefense = usePokemonTypeDefense(first.pokemon?.types);
  const secondDefense = usePokemonTypeDefense(second.pokemon?.types);
  // Lato scelto con «Cambia»; senza scelta si chiede il Pokémon che manca.
  const [picking, setPicking] = useState<0 | 1 | null>(null);
  const missing = first.id === null ? 0 : second.id === null ? 1 : null;
  const slot = picking ?? missing;

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (slot !== null) {
    const other = slot === 0 ? second.pokemon : first.pokemon;
    return (
      <PokemonPicker
        title={other ? t('picker.compareWith', { name: pokemonName(other.id, other.name) }) : t('picker.choose')}
        onPick={(pokemon) => {
          router.setParams({ [SLOTS[slot]]: String(pokemon.id) });
          setPicking(null);
        }}
        onClose={() => (picking !== null && missing === null ? setPicking(null) : goBack())}
      />
    );
  }

  return (
    <CompareView
      first={{
        pokemon: first.pokemon,
        isLoading: first.isLoading,
        errorMessage: first.errorMessage,
        defense: firstDefense.groups,
        isDefenseLoading: firstDefense.isLoading,
        defenseErrorMessage: firstDefense.errorMessage,
      }}
      second={{
        pokemon: second.pokemon,
        isLoading: second.isLoading,
        errorMessage: second.errorMessage,
        defense: secondDefense.groups,
        isDefenseLoading: secondDefense.isLoading,
        defenseErrorMessage: secondDefense.errorMessage,
      }}
      onBack={goBack}
      onRetry={() => {
        if (first.isError) void first.refetch();
        if (second.isError) void second.refetch();
        void firstDefense.refetch();
        void secondDefense.refetch();
      }}
      onChange={setPicking}
      onOpenPokemon={(id) => router.push({ pathname: '/pokemon/[id]', params: { id: String(id) } })}
    />
  );
}
