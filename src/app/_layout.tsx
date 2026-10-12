import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { QueryProvider } from '@/api/QueryProvider';
import { FontsGate } from '@/components/FontsGate';
import { colors, radius } from '@/theme/colors';

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
          <Stack.Screen name="settings" options={{ title: 'Impostazioni' }} />
          {/* Sezione Oggetti: elenco (ItemsList) e dettaglio (ItemDetail, param itemId). */}
          <Stack.Screen name="items/index" options={{ title: 'Oggetti' }} />
          <Stack.Screen name="items/[itemId]" options={{ title: 'Dettaglio oggetto' }} />
          {/* Menu delle sezioni, aperto toccando il titolo in alto a sinistra. */}
          <Stack.Screen
            name="menu"
            options={{
              title: 'Sezioni',
              presentation: 'formSheet',
              sheetAllowedDetents: 'fitToContents',
              sheetGrabberVisible: true,
              sheetCornerRadius: radius.sheet,
              contentStyle: { backgroundColor: colors.background },
            }}
          />
        </Stack>
      </FontsGate>
    </QueryProvider>
  );
}
