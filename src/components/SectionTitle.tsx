import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { getSection, TAB_SECTIONS, type SectionKey } from '@/navigation/sections';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { themedStyles } from '@/theme/styles';

import { Icon } from './Icon';
import { PokeBallLogo } from './PokeBallLogo';

type Props = {
  section: SectionKey;
};

/**
 * Titolo in alto a sinistra. Le sezioni della barra in basso mostrano solo il titolo; quelle
 * aperte da Altro hanno anche la freccia per tornare indietro.
 */
export function SectionTitle({ section }: Props) {
  const { t } = useTranslation('common');
  const { title } = getSection(section);
  const isTab = TAB_SECTIONS.includes(section);
  return (
    <View style={styles.container}>
      {isTab ? (
        <PokeBallLogo />
      ) : (
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/more'))}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <Icon name="back" size={18} color={colors.text} />
        </Pressable>
      )}
      <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = themedStyles(() => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  title: {
    flexShrink: 1,
    marginLeft: 2,
    fontFamily: fonts.displayBold,
    fontSize: 30,
    letterSpacing: -0.6,
    color: colors.text,
  },
}));
