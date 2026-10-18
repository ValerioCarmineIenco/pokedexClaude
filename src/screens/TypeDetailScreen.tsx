import { router, useLocalSearchParams } from 'expo-router';

import { parseTypeName } from '@/api/types';
import { TypeDetailView } from '@/components/types/TypeDetailView';

/**
 * Schermata dettaglio tipo. Il file di rotta la riesporta:
 * `export { default } from '@/screens/TypeDetailScreen';`
 */
export default function TypeDetailScreen() {
  const { typeId } = useLocalSearchParams<{ typeId: string }>();

  return (
    <TypeDetailView
      type={parseTypeName(typeId)}
      // Pokémon, mosse e altri tipi si impilano: "Indietro" riporta a questo tipo.
      onOpenPokemon={(id) => router.push({ pathname: '/pokemon/[id]', params: { id: String(id) } })}
      onOpenMove={(id) => router.push({ pathname: '/moves/[moveId]', params: { moveId: String(id) } })}
      onOpenType={(type) => router.push({ pathname: '/types/[typeId]', params: { typeId: type } })}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/types'))}
    />
  );
}
