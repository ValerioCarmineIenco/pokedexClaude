import { Pressable } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { colors, radius } from '@/theme/colors';
import { themedStyles } from '@/theme/styles';

import { AppText } from './AppText';

type Props = {
  label: string;
  selected?: boolean;
  icon?: IconName;
  onPress?: () => void;
};

/** Chip dei filtri: bordo sottile, oppure pieno e invertito quando è selezionato. */
export function Chip({ label, selected = false, icon, onPress }: Props) {
  const color = selected ? colors.onSelected : colors.textMuted;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}>
      {icon && <Icon name={icon} size={13} color={color} />}
      <AppText variant="label" color={color} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = themedStyles(() => ({
  chip: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  selected: {
    backgroundColor: colors.selected,
    borderColor: colors.selected,
  },
  pressed: { opacity: 0.7 },
}));
