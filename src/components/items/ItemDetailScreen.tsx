import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { Icon } from '../Icon';

type Props = {
  /** Id PokéAPI dell'oggetto; null se il parametro della rotta non è un numero valido. */
  itemId: number | null;
};

/**
 * Dettaglio di un oggetto.
 * Segnaposto: qui arriveranno immagine, descrizione e fino a 5 oggetti correlati.
 */
export function ItemDetailScreen({ itemId }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/items'))}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Indietro"
        style={styles.back}>
        <Icon name="back" size={20} color={colors.text} />
      </Pressable>
      <View style={styles.placeholder}>
        <Text style={styles.message}>
          {itemId === null ? 'Oggetto non trovato.' : `Dettaglio dell'oggetto n. ${itemId}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  back: {
    margin: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  message: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    textAlign: 'center',
    color: colors.textMuted,
  },
});
