import { Stack } from 'expo-router';
import { View } from 'react-native';

import { AdBanner } from '@/ads/AdBanner';
import { InterstitialController } from '@/ads/InterstitialController';
import { QueryProvider } from '@/api/QueryProvider';
import { FontsGate } from '@/components/FontsGate';
import { LanguageGate } from '@/components/LanguageGate';
import { StartupLoader } from '@/components/LoadingScreen';
import { ThemeGate } from '@/components/ThemeGate';
import { t } from '@/i18n';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/styles';

export default function RootLayout() {
  return (
    <QueryProvider>
      <FontsGate>
        <ThemeGate>
        {/* Le schermate occupano lo spazio sopra il banner pubblicitario, che non le copre. */}
        <View style={styles.screens}>
          <LanguageGate>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}>
              {/* Pokédex, Mosse, Squadre e Altro, con la barra in basso (vedi (tabs)/_layout). */}
              <Stack.Screen name="(tabs)" options={{ title: t('common:screens.pokedex') }} />
              <Stack.Screen
                name="pokemon/[id]"
                options={{ title: t('common:screens.pokemonDetail') }}
              />
              {/* Confronto tra due Pokémon (param a e b, i due id). */}
              <Stack.Screen name="compare" options={{ title: t('common:screens.compare') }} />
              <Stack.Screen name="settings" options={{ title: t('common:screens.settings') }} />
              {/* 2.0: scelta del tema e dell'icona, e negozio degli acquisti in-app. */}
              <Stack.Screen name="themes" options={{ title: t('common:screens.themes') }} />
              <Stack.Screen name="premium" options={{ title: t('common:screens.premium') }} />
              {/* Catalogo dei componenti del design 2.0, solo in sviluppo. */}
              <Stack.Screen name="design" options={{ title: t('design:title') }} />
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
              {/* Sezione Mosse: dettaglio (param moveId); l'elenco è nella barra in basso. */}
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
              {/* Sezione Squadre: squadra da modificare (param teamId); l'elenco è nella barra. */}
              <Stack.Screen name="teams/[teamId]" options={{ title: t('common:screens.team') }} />
            </Stack>
          </LanguageGate>
        </View>
        <AdBanner />
        <InterstitialController />
        {/* Schermata di caricamento iniziale, sopra lo Stack finché la cache non è pronta. */}
        <StartupLoader />
        </ThemeGate>
      </FontsGate>
    </QueryProvider>
  );
}

const styles = themedStyles(() => ({
  screens: { flex: 1 },
}));
