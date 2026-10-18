import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { Icon, type IconName } from './Icon';

type Props = {
  /** L'artwork in alto è quello cromatico. */
  showShiny: boolean;
  onShowShinyChange: (showShiny: boolean) => void;
  /** Lo shiny di questo Pokémon è stato ottenuto. */
  isCaught: boolean;
  onToggleCaught: () => void;
};

/** Sotto l'artwork della scheda: «Mostra shiny» e il segno «Shiny ottenuto». */
export function ShinyControls({ showShiny, onShowShinyChange, isCaught, onToggleCaught }: Props) {
  return (
    <View style={styles.row}>
      <Toggle
        icon="sparkles"
        label="Mostra shiny"
        checked={showShiny}
        onPress={() => onShowShinyChange(!showShiny)}
      />
      <Toggle
        icon={isCaught ? 'check' : 'checkOutline'}
        label={isCaught ? 'Shiny ottenuto' : 'Segna shiny ottenuto'}
        accessibilityLabel="Shiny ottenuto"
        checked={isCaught}
        onPress={onToggleCaught}
      />
    </View>
  );
}

function Toggle({
  icon,
  label,
  accessibilityLabel = label,
  checked,
  onPress,
}: {
  icon: IconName;
  label: string;
  accessibilityLabel?: string;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked }}
      style={({ pressed }) => [styles.toggle, checked && styles.toggleOn, pressed && styles.pressed]}>
      <Icon name={icon} size={16} color={checked ? colors.shinyText : colors.textMuted} />
      <Text style={[styles.label, checked && styles.labelOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.field,
  },
  toggleOn: {
    backgroundColor: colors.shiny,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  labelOn: {
    color: colors.shinyText,
  },
});
