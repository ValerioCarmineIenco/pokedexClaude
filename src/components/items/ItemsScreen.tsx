import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { SectionTitle } from '../SectionTitle';

/**
 * Sezione Oggetti, elenco degli strumenti.
 * Segnaposto: qui arriveranno la lista in griglia o in righe e i colori per categoria.
 */
export function ItemsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <SectionTitle section="items" />
        </View>
      </View>
      <View style={styles.placeholder}>
        <Text style={styles.message}>L&apos;elenco degli oggetti arriva presto.</Text>
        <Pressable
          onPress={() => router.push({ pathname: '/items/[itemId]', params: { itemId: '17' } })}
          accessibilityRole="button">
          <Text style={styles.link}>Apri un oggetto di prova</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 40,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  message: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    textAlign: 'center',
    color: colors.textMuted,
  },
  link: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.accent,
  },
});
