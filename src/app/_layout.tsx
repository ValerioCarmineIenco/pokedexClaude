import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { AdBanner } from '@/ads/AdBanner';
import { InterstitialController } from '@/ads/InterstitialController';
import { QueryProvider } from '@/api/QueryProvider';
import { FontsGate } from '@/components/FontsGate';
import { StartupLoader } from '@/components/LoadingScreen';
import { colors, radius } from '@/theme/colors';

export default function RootLayout() {
  return (
    <QueryProvider>
      <FontsGate>
        <StatusBar style="dark" />
        {/* Le schermate occupano lo spazio sopra il banner pubblicitario, che non le copre. */}
        <View style={styles.screens}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}>
            <Stack.Screen name="index" options={{ title: 'Pokédex' }} />
            <Stack.Screen name="pokemon/[id]" options={{ title: 'Dettaglio' }} />
            {/* Confronto tra due Pokémon (param a e b, i due id). */}
            <Stack.Screen name="compare" options={{ title: 'Confronto' }} />
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
            {/* Sezione Tipi: tabella delle efficacie e dettaglio (param typeId, es. «dragon»). */}
            <Stack.Screen name="types/index" options={{ title: 'Tipi' }} />
            <Stack.Screen name="types/[typeId]" options={{ title: 'Dettaglio tipo' }} />
            {/* Sezione Squadre: elenco e squadra da modificare (param teamId). */}
            <Stack.Screen name="teams/index" options={{ title: 'Squadre' }} />
            <Stack.Screen name="teams/[teamId]" options={{ title: 'Squadra' }} />
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
        </View>
        <AdBanner />
        <InterstitialController />
        {/* Schermata di caricamento iniziale, sopra lo Stack finché la cache non è pronta. */}
        <StartupLoader />
      </FontsGate>
    </QueryProvider>
  );
}

const styles = StyleSheet.create({
  screens: { flex: 1 },
});
