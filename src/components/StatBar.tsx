import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { MAX_STAT } from '@/utils/format';

type Props = {
  label: string;
  value: number;
  color: string;
};

/** Una statistica base: etichetta, valore e barra su scala fissa a 255. */
export function StatBar({ label, value, color }: Props) {
  const width = `${Math.min(100, (value / MAX_STAT) * 100)}%` as const;
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label} ${value}`}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 24,
  },
  label: {
    width: 72,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textSubtle,
  },
  value: {
    width: 32,
    textAlign: 'right',
    fontFamily: fonts.monoBold,
    fontSize: 13,
    color: colors.text,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
