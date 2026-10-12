import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { FontsGate } from '@/components/FontsGate';
import { colors } from '@/theme/colors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
