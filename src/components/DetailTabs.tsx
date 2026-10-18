import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

export type DetailTab = 'info' | 'evolutions' | 'moves' | 'artwork';

const TABS: readonly DetailTab[] = ['info', 'evolutions', 'moves', 'artwork'];

export function isDetailTab(value: unknown): value is DetailTab {
  return TABS.some((tab) => tab === value);
}

type Props = {
  value: DetailTab;
  onChange: (tab: DetailTab) => void;
};

/** Selettore delle tab della scheda, con lo stesso aspetto del selettore di vista dell'elenco. */
export function DetailTabs({ value, onChange }: Props) {
  const { t } = useTranslation('pokemon');
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {TABS.map((tab) => {
        const selected = value === tab;
        const label = t(`tabs.${tab}`);
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            style={[styles.option, selected && styles.optionSelected]}>
            <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
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
    flex: 1,
    height: 38,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: colors.surface,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.12)',
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textSubtle,
  },
  labelSelected: {
    color: colors.text,
  },
});
