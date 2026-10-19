import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { AdBanner } from '@/ads/AdBanner';
import { InterstitialController } from '@/ads/InterstitialController';
import { QueryProvider } from '@/api/QueryProvider';
import { FontsGate } from '@/components/FontsGate';
import { LanguageGate } from '@/components/LanguageGate';
import { StartupLoader } from '@/components/LoadingScreen';
import { t } from '@/i18n';
import { colors, radius } from '@/theme/colors';

export default function RootLayout() {
  return (
    <QueryProvider>
      <FontsGate>
        {/* Le schermate occupano lo spazio sopra il banner pubblicitario, che non le copre. */}
        <View style={styles.screens}>
          <LanguageGate>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}>
              <Stack.Screen name="index" options={{ title: t('common:screens.pokedex') }} />
              <Stack.Screen
                name="pokemon/[id]"
                options={{ title: t('common:screens.pokemonDetail') }}
              />
              {/* Confronto tra due Pokémon (param a e b, i due id). */}
              <Stack.Screen name="compare" options={{ title: t('common:screens.compare') }} />
              <Stack.Screen name="settings" options={{ title: t('common:screens.settings') }} />
              {/* Sezione Oggetti: elenco (ItemsList) e dettaglio (ItemDetail, param itemId). */}
              <Stack.Screen name="items/index" options={{ title: t('common:screens.items') }} />
              <Stack.Screen
                name="items/[itemId]"
                options={{ title: t('common:screens.itemDetail') }}
              />
              {/* Sezione Abilità: elenco senza categorie e dettaglio (param abilityId). */}
              <Stack.Screen
                name="abilities/index"
                options={{ title: t('common:screens.abilities') }}
              />
              <Stack.Screen
                name="abilities/[abilityId]"
                options={{ title: t('common:screens.abilityDetail') }}
              />
              {/* Sezione Mosse: elenco senza categorie e dettaglio (param moveId). */}
              <Stack.Screen name="moves/index" options={{ title: t('common:screens.moves') }} />
              <Stack.Screen
                name="moves/[moveId]"
                options={{ title: t('common:screens.moveDetail') }}
              />
              {/* Sezione Nature: solo elenco, niente dettaglio. */}
              <Stack.Screen name="natures/index" options={{ title: t('common:screens.natures') }} />
              {/* Sezione Località: elenco per regione e dettaglio (param locationId). */}
              <Stack.Screen
                name="locations/index"
                options={{ title: t('common:screens.locations') }}
              />
              <Stack.Screen
                name="locations/[locationId]"
                options={{ title: t('common:screens.locationDetail') }}
              />
              {/* Sezione Tipi: tabella delle efficacie e dettaglio (param typeId, es. «dragon»). */}
              <Stack.Screen name="types/index" options={{ title: t('common:screens.types') }} />
              <Stack.Screen
                name="types/[typeId]"
                options={{ title: t('common:screens.typeDetail') }}
              />
              {/* Sezione Squadre: elenco e squadra da modificare (param teamId). */}
              <Stack.Screen name="teams/index" options={{ title: t('common:screens.teams') }} />
              <Stack.Screen name="teams/[teamId]" options={{ title: t('common:screens.team') }} />
              {/* Menu delle sezioni, aperto toccando il titolo in alto a sinistra. */}
              <Stack.Screen
                name="menu"
                options={{
                  title: t('common:screens.sections'),
                  presentation: 'formSheet',
                  sheetAllowedDetents: 'fitToContents',
                  sheetGrabberVisible: true,
                  sheetCornerRadius: radius.sheet,
                  contentStyle: { backgroundColor: colors.background },
                }}
              />
            </Stack>
          </LanguageGate>
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
