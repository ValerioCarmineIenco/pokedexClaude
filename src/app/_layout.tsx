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
          {/* Sezione Abilità: elenco senza categorie e dettaglio (param abilityId). */}
          <Stack.Screen name="abilities/index" options={{ title: 'Abilità' }} />
          <Stack.Screen name="abilities/[abilityId]" options={{ title: 'Dettaglio abilità' }} />
          {/* Sezione Mosse: elenco senza categorie e dettaglio (param moveId). */}
          <Stack.Screen name="moves/index" options={{ title: 'Mosse' }} />
          <Stack.Screen name="moves/[moveId]" options={{ title: 'Dettaglio mossa' }} />
          {/* Sezione Nature: solo elenco, niente dettaglio. */}
          <Stack.Screen name="natures/index" options={{ title: 'Nature' }} />
          {/* Sezione Località: elenco per regione e dettaglio (param locationId). */}
          <Stack.Screen name="locations/index" options={{ title: 'Località' }} />
          <Stack.Screen name="locations/[locationId]" options={{ title: 'Dettaglio località' }} />
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
