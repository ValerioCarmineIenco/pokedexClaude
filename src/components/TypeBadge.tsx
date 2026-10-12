import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/theme/fonts';
import { TYPE_COLORS, typeTextColor } from '@/theme/typeColors';
import { TYPE_NAMES_IT } from '@/theme/typeNames';
import type { TypeName } from '@/types/pokemon';

type Props = {
  type: TypeName;
  size?: 'small' | 'large';
};

export function TypeBadge({ type, size = 'small' }: Props) {
  return (
    <View
      style={[
        styles.badge,
        size === 'large' && styles.badgeLarge,
        { backgroundColor: TYPE_COLORS[type] },
      ]}>
      <Text
        style={[styles.label, size === 'large' && styles.labelLarge, { color: typeTextColor(type) }]}>
        {TYPE_NAMES_IT[type]}
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
