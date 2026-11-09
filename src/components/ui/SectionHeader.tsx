import type { ReactNode } from 'react';
import { View } from 'react-native';

import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/styles';

import { AppText } from './AppText';

type Props = {
  title: string;
  /**
   * `section`: titolo in Anton dentro una schermata («COLORI»).
   * `eyebrow`: etichetta piccola in maiuscoletto sopra un gruppo («COPERTURE FORTI»).
   */
  variant?: 'section' | 'eyebrow';
  /** Testo o elemento a destra («6/6»). */
  trailing?: ReactNode;
};

/** Titolo di una sezione dentro una schermata. */
export function SectionHeader({ title, variant = 'section', trailing }: Props) {
  const eyebrow = variant === 'eyebrow';
  return (
    <View style={styles.row}>
      <AppText
        variant={eyebrow ? 'label' : 'section'}
        color={eyebrow ? colors.textMuted : colors.text}
        accessibilityRole="header"
        style={styles.title}>
        {title}
      </AppText>
      {typeof trailing === 'string' ? (
        <AppText variant="caption" color={colors.textMuted}>
          {trailing}
        </AppText>
      ) : (
        trailing
      )}
    </View>
  );
}

const styles = themedStyles(() => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: { flexShrink: 1 },
}));
