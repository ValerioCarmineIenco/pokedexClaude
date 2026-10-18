import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import type { ViewMode } from '@/hooks/useViewMode';
import { colors } from '@/theme/colors';

import { Icon, type IconName } from './Icon';

type Props = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
};

const OPTIONS: { mode: ViewMode; icon: IconName }[] = [
  { mode: 'grid', icon: 'grid' },
  { mode: 'row', icon: 'rows' },
];

export function ViewToggle({ value, onChange }: Props) {
  const { t } = useTranslation('pokedex');
  return (
    <View style={styles.track} accessibilityRole="radiogroup">
      {OPTIONS.map(({ mode, icon }) => {
        const selected = value === mode;
        return (
          <Pressable
            key={mode}
            onPress={() => onChange(mode)}
            hitSlop={4}
            accessibilityRole="radio"
            accessibilityLabel={t(`viewToggle.${mode}`)}
            accessibilityState={{ selected }}
            style={[styles.option, selected && styles.optionSelected]}>
            <Icon name={icon} size={16} color={selected ? colors.text : colors.textSubtle} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.field,
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  option: {
    width: 38,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: colors.surface,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.12)',
  },
});
