import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import type { LocationRegion } from '@/types/location';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

type Props = {
  regions: LocationRegion[];
  /** Slug della regione scelta; null = tutte. */
  value: string | null;
  onChange: (region: string | null) => void;
};

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Regione: ${label}`}
      style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

/** Fila di regioni scorrevole in orizzontale, con «Tutte» in testa. */
export function RegionChips({ regions, value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}>
      <Chip label="Tutte" selected={value === null} onPress={() => onChange(null)} />
      {regions.map((region) => (
        <Chip
          key={region.name}
          label={region.label}
          selected={value === region.name}
          onPress={() => onChange(region.name)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    marginHorizontal: -16,
  },
  row: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.text,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textMuted,
  },
  labelSelected: {
    fontFamily: fonts.bodyBold,
    color: colors.surface,
  },
});
