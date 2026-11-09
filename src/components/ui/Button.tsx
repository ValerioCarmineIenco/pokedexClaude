import { Pressable } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { colors, radius } from '@/theme/colors';
import { themedStyles } from '@/theme/styles';

import { AppText } from './AppText';

type Props = {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  /**
   * `primary`: pieno nel colore d'accento («+ Nuova», «Sblocca»).
   * `secondary`: su superficie, con bordo sottile.
   * `inverted`: pieno e invertito, come una chip selezionata.
   */
  variant?: 'primary' | 'secondary' | 'inverted';
  disabled?: boolean;
  /** Occupa tutta la larghezza disponibile. */
  block?: boolean;
};

/** Pulsante con testo, e un'icona a sinistra se serve. */
export function Button({ label, onPress, icon, variant = 'primary', disabled, block }: Props) {
  const color =
    variant === 'primary' ? colors.onAccent : variant === 'inverted' ? colors.onSelected : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        block && styles.block,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      {icon && <Icon name={icon} size={18} color={color} />}
      <AppText variant="bodyStrong" color={color} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = themedStyles(() => ({
  button: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 20,
    borderRadius: radius.field + 4,
  },
  primary: { backgroundColor: colors.accent },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  inverted: { backgroundColor: colors.selected },
  block: { alignSelf: 'stretch' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.4 },
}));
