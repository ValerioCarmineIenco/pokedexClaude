import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';

import { getSection, type SectionKey } from '@/navigation/sections';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { Icon } from './Icon';
import { PokeBallLogo } from './PokeBallLogo';

type Props = {
  section: SectionKey;
};

/** Titolo in alto a sinistra: toccandolo si apre il menu per cambiare sezione. */
export function SectionTitle({ section }: Props) {
  const { t } = useTranslation('pokedex');
  const { title } = getSection(section);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/menu', params: { current: section } })}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={t('sectionMenu.titleLabel', { title })}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <PokeBallLogo />
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Icon name="expand" size={16} color={colors.textSubtle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.6,
  },
  title: {
    marginLeft: 2,
    fontFamily: fonts.displayBold,
    fontSize: 30,
    letterSpacing: -0.6,
    color: colors.text,
  },
});
