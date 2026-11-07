import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme/colors';
import { themedStyles } from '@/theme/styles';

type Props = {
  children: ReactNode;
  /** Senza spaziatura interna: per gruppi di righe che arrivano ai bordi. */
  flush?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Riquadro su superficie con bordo sottile: squadre, gruppi di righe, statistiche. */
export function Panel({ children, flush, style }: Props) {
  return <View style={[styles.panel, !flush && styles.padded, style]}>{children}</View>;
}

const styles = themedStyles(() => ({
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: colors.outline,
    overflow: 'hidden',
  },
  padded: { padding: 18, gap: 14 },
}));
