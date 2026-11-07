import { Pressable } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/styles';

type Props = {
  icon: IconName;
  /** Obbligatoria: il pulsante non ha testo, lo screen reader legge questa. */
  accessibilityLabel: string;
  onPress?: () => void;
  /**
   * `surface`: cerchio sulla superficie del tema (indietro nelle schermate normali).
   * `veil`: cerchio scuro traslucido sopra un fondo colorato (testata della scheda).
   */
  variant?: 'surface' | 'veil';
  /** Colore dell'icona; di base quello del testo (bianco su `veil`). */
  color?: string;
};

/** Pulsante tondo con sola icona: indietro, preferito, shiny. */
export function IconButton({ icon, accessibilityLabel, onPress, variant = 'surface', color }: Props) {
  const tint = color ?? (variant === 'veil' ? '#FFFFFF' : colors.text);
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.button, styles[variant], pressed && styles.pressed]}>
      <Icon name={icon} size={20} color={tint} />
    </Pressable>
  );
}

const styles = themedStyles(() => ({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surface: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  veil: { backgroundColor: 'rgba(0, 0, 0, 0.22)' },
  pressed: { opacity: 0.7 },
}));
