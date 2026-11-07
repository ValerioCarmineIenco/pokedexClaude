import { View } from 'react-native';

import { colors, radius } from '@/theme/colors';
import { themedStyles } from '@/theme/styles';

import { AppText } from './AppText';

type Props = {
  value: number;
  label: string;
  /** Riempimento della barra in basso (0–1). */
  ratio: number;
  /** Colore della barra: di solito quello del tipo principale. */
  color: string;
};

/** Riquadro di una statistica: numero grande, nome e barra sottile sul fondo. */
export function StatTile({ value, label, ratio, color }: Props) {
  const width = `${Math.round(Math.max(0, Math.min(1, ratio)) * 100)}%` as const;
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${label} ${value}`}>
      <AppText variant="stat">{value}</AppText>
      <AppText variant="label" color={colors.textMuted} numberOfLines={1}>
        {label}
      </AppText>
      <View style={[styles.bar, { width, backgroundColor: color }]} />
    </View>
  );
}

const styles = themedStyles(() => ({
  tile: {
    flex: 1,
    minWidth: 96,
    backgroundColor: colors.surface,
    borderRadius: radius.tile - 4,
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 4,
    overflow: 'hidden',
  },
  bar: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 3,
  },
}));
