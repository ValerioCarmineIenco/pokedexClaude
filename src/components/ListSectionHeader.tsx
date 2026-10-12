import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

type Props = {
  title: string;
  /** Dettaglio accanto al titolo (regione e numeri, conteggio…). */
  meta: string;
  /** Prima intestazione dell'elenco: meno spazio sopra. */
  isFirst: boolean;
  /** Rientro orizzontale, per allinearsi alle celle della griglia. */
  inset: number;
  /** Pallino colorato prima del titolo (es. il colore della categoria). */
  swatch?: string;
};

/** Intestazione di gruppo negli elenchi completi: una generazione, una categoria di oggetti. */
export function ListSectionHeader({ title, meta, isFirst, inset, swatch }: Props) {
  return (
    <View
      style={[styles.header, { paddingHorizontal: inset }, !isFirst && styles.spaced]}
      accessibilityRole="header">
      {swatch && <View style={[styles.swatch, { backgroundColor: swatch }]} />}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>{meta}</Text>
      <View style={styles.rule} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    paddingTop: 4,
    paddingBottom: 10,
  },
  spaced: {
    paddingTop: 18,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    letterSpacing: -0.2,
    color: colors.text,
  },
  meta: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.2,
    color: colors.textSubtle,
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    alignSelf: 'center',
  },
});
