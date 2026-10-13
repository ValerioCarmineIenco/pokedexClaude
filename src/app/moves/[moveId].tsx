import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { getMoveSummary, parseMoveId } from '@/api/moves';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

// Segnaposto: il dettaglio completo (con l'efficacia del tipo) arriva con la sua schermata.
export default function MoveDetailPlaceholder() {
  const insets = useSafeAreaInsets();
  const { moveId } = useLocalSearchParams<{ moveId: string }>();
  const id = parseMoveId(moveId);
  const move = id === null ? undefined : getMoveSummary(id);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Indietro"
        style={styles.back}>
        <Icon name="back" size={20} color={colors.text} />
      </Pressable>
      <Text style={styles.title}>{move?.name ?? 'Mossa non trovata'}</Text>
      <Text style={styles.text}>Il dettaglio della mossa sarà disponibile a breve.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: colors.background,
  },
  back: {
    alignSelf: 'flex-start',
    padding: 4,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: colors.text,
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
  },
});
