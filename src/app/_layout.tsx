import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { QueryProvider } from '@/api/QueryProvider';
import { FontsGate } from '@/components/FontsGate';
import { colors } from '@/theme/colors';

export default function RootLayout() {
  return (
    <QueryProvider>
      <FontsGate>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}>
          <Stack.Screen name="index" options={{ title: 'Pokédex' }} />
          <Stack.Screen name="pokemon/[id]" options={{ title: 'Dettaglio' }} />
        </Stack>
      </FontsGate>
    </QueryProvider>
  );
}
