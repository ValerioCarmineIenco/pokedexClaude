import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SECTIONS, type Section, type SectionKey } from '@/navigation/sections';
import { colors, radius } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { Icon } from './Icon';
import { PokeBallLogo } from './PokeBallLogo';

type Props = {
  current: SectionKey;
  onSelect: (section: Section) => void;
};

/** Contenuto del bottom sheet: una riga per ogni sezione dell'app. */
export function SectionMenu({ current, onSelect }: Props) {
  const { t } = useTranslation('pokedex');
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
      <Text style={styles.heading} accessibilityRole="header">
        {t('sectionMenu.heading')}
      </Text>
      {SECTIONS.map((section) => {
        const selected = section.key === current;
        return (
          <Pressable
            key={section.key}
            onPress={() => onSelect(section)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.option,
              selected && styles.optionSelected,
              pressed && styles.pressed,
            ]}>
            <View style={styles.badge}>
              {section.icon ? (
                <Icon name={section.icon} size={20} color={colors.accent} />
              ) : (
                <PokeBallLogo size={22} />
              )}
            </View>
            <View style={styles.text}>
              <Text style={styles.title}>{section.title}</Text>
              <Text style={styles.description} numberOfLines={1}>
                {section.description}
              </Text>
            </View>
            {selected && <Icon name="check" size={18} color={colors.accent} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 10,
    backgroundColor: colors.background,
  },
  heading: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textSubtle,
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.7,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.factBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.text,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
});
