import { StyleSheet, Text, View } from 'react-native';

import type { ItemCategory } from '@/types/item';
import { getCategoryColors } from '@/theme/categoryColors';
import { fonts } from '@/theme/fonts';

type Props = {
  category: ItemCategory;
  size?: 'small' | 'large';
};

/** Etichetta colorata della categoria di un oggetto, gemella di TypeBadge. */
export function CategoryBadge({ category, size = 'small' }: Props) {
  const palette = getCategoryColors(category);
  return (
    <View
      style={[styles.badge, size === 'large' && styles.badgeLarge, { backgroundColor: palette.color }]}>
      <Text style={[styles.label, size === 'large' && styles.labelLarge, { color: palette.text }]}>
        {palette.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  labelLarge: {
    fontSize: 13,
  },
});
