import { Stack } from 'expo-router';

import { QueryProvider } from '@/api/QueryProvider';

export default function RootLayout() {
  return (
    <QueryProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Pokédex' }} />
        <Stack.Screen name="pokemon/[id]" options={{ title: 'Dettaglio' }} />
      </Stack>
    </QueryProvider>
  );
}
