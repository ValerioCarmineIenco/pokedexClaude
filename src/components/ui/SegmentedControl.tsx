import { Pressable, View } from 'react-native';

import { colors, radius } from '@/theme/colors';
import { themedStyles } from '@/theme/styles';

import { AppText } from './AppText';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Schede in un'unica barra (Info, Evoluzioni, Mosse, Forme): la scelta è piena e invertita. */
export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.segment, selected && styles.selected]}>
            <AppText
              variant="bodyStrong"
              color={selected ? colors.onSelected : colors.textMuted}
              numberOfLines={1}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = themedStyles(() => ({
  bar: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    borderRadius: radius.field + 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  // Larghezza in base al testo, poi lo spazio avanzato diviso tra tutte: «Evoluzioni» non si taglia.
  segment: {
    flexGrow: 1,
    flexShrink: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.field,
    paddingHorizontal: 6,
  },
  selected: { backgroundColor: colors.selected },
}));
