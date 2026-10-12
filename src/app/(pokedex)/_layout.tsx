import { Stack } from 'expo-router';

import { colors } from '@/theme/colors';

/** Tab Pokédex: elenco e, sopra, la scheda di ogni Pokémon. */
export default function PokedexLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="index" options={{ title: 'Pokédex' }} />
      <Stack.Screen name="pokemon/[id]" options={{ title: 'Dettaglio' }} />
    </Stack>
  );
}
