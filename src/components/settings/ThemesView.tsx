import { useTranslation } from 'react-i18next';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALTERNATE_ICONS_SUPPORTED, APP_ICONS, useAppIcon, type AppIcon, type AppIconAccess } from '@/purchases/appIcon';
import { useEntitlements } from '@/purchases/store';
import { colors, radius } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { themedStyles } from '@/theme/styles';
import { useThemePreference } from '@/theme/themeStore';
import { THEMES, type Theme } from '@/theme/themes';

import { Icon } from '../Icon';
import { AppIconPreview } from './AppIconPreview';
import { ThemePreview } from './ThemePreview';

type Props = {
  onBack: () => void;
  /** Tocco su un tema o un'icona bloccati: porta al negozio. */
  onUnlock: () => void;
};

/** Scelta del tema (3 gratuiti, 3 premium, o automatico) e dell'icona dell'app. */
export function ThemesView({ onBack, onUnlock }: Props) {
  const { t } = useTranslation('settings');
  const insets = useSafeAreaInsets();
  const [preference, setPreference] = useThemePreference();
  const entitlements = useEntitlements();
  const unlocked = entitlements.has('styles');

  const choose = (theme: Theme) => {
    if (theme.premium && !unlocked) onUnlock();
    else setPreference(theme.id);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}>
      <Pressable
        onPress={onBack}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={t('back')}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <Icon name="back" size={18} color={colors.text} />
      </Pressable>
      <Text style={styles.title} accessibilityRole="header">
        {t('themes.title')}
      </Text>
      <Text style={styles.hint}>{t('themes.hint')}</Text>

      <Pressable
        onPress={() => setPreference('system')}
        accessibilityRole="radio"
        accessibilityState={{ selected: preference === 'system' }}
        style={({ pressed }) => [styles.autoRow, preference === 'system' && styles.selected, pressed && styles.pressed]}>
        <View style={styles.autoSwatches}>
          <View style={[styles.autoHalf, { backgroundColor: THEMES[0].palette.background }]} />
          <View style={[styles.autoHalf, { backgroundColor: THEMES[1].palette.background }]} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.label}>{t('themes.auto')}</Text>
          <Text style={styles.description}>{t('themes.autoHint')}</Text>
        </View>
        {preference === 'system' ? (
          <Icon name="check" size={22} color={colors.accent} />
        ) : (
          <View style={styles.radio} />
        )}
      </Pressable>

      <Text style={styles.sectionTitle} accessibilityRole="header">
        {t('themes.free')}
      </Text>
      <View style={styles.grid}>
        {THEMES.filter((theme) => !theme.premium).map((theme) => (
          <ThemeCard key={theme.id} theme={theme} selected={preference === theme.id} locked={false} onPress={() => choose(theme)} />
        ))}
      </View>

      <View style={styles.premiumHeader}>
        <Icon name="star" size={16} color={colors.accent} />
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {t('themes.premium')}
        </Text>
      </View>
      <Text style={styles.sectionHint}>{t('themes.premiumHint')}</Text>
      <View style={styles.grid}>
        {THEMES.filter((theme) => theme.premium).map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            selected={preference === theme.id}
            locked={!unlocked}
            onPress={() => choose(theme)}
          />
        ))}
      </View>

      <AppIconSection unlocked={unlocked} onUnlock={onUnlock} />
    </ScrollView>
  );
}

function ThemeCard({
  theme,
  selected,
  locked,
  onPress,
}: {
  theme: Theme;
  selected: boolean;
  locked: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation('settings');
  const name = t(`themes.names.${theme.id}`);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={locked ? `${name}. ${t('themes.locked')}` : name}
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.card, selected && styles.selected, pressed && styles.pressed]}>
      <View>
        <ThemePreview palette={theme.palette} />
        {locked ? (
          <View style={styles.lockBadge}>
            <Icon name="lock" size={12} color={colors.onAccent} />
          </View>
        ) : null}
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.flex}>
          <Text style={styles.label} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.description} numberOfLines={1}>
            {t(`themes.descriptions.${theme.id}`)}
          </Text>
        </View>
        {selected ? <Icon name="check" size={20} color={colors.accent} /> : null}
      </View>
    </Pressable>
  );
}

/** Se un'icona è sbloccata. */
function iconUnlocked(access: AppIconAccess, styles: boolean) {
  if (access === 'free') return true;
  if (access === 'styles') return styles;
  // L'icona Dispositivo si sblocca con il tema Dispositivo, che arriva con il suo modulo.
  return false;
}

function AppIconSection({ unlocked, onUnlock }: { unlocked: boolean; onUnlock: () => void }) {
  const { t } = useTranslation('settings');
  const [current, setCurrent] = useAppIcon();
  const choose = (icon: AppIcon) => {
    if (!iconUnlocked(icon.access, unlocked)) onUnlock();
    else if (icon.id !== current) setCurrent(icon.id).catch(() => {});
  };
  return (
    <View style={styles.iconSection}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {t('themes.icon.title')}
      </Text>
      <Text style={styles.sectionHint}>{t('themes.icon.hint')}</Text>
      <View style={styles.icons} accessibilityRole="radiogroup">
        {APP_ICONS.map((icon) => {
          const selected = icon.id === current;
          const locked = !iconUnlocked(icon.access, unlocked);
          const name = t(`themes.icon.names.${icon.id}`);
          return (
            <Pressable
              key={icon.id}
              onPress={() => choose(icon)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={locked ? `${name}. ${t(`themes.icon.access.${icon.access}`)}` : name}
              style={({ pressed }) => [styles.iconOption, pressed && styles.pressed]}>
              <View style={[styles.iconRing, selected && styles.iconRingSelected]}>
                <AppIconPreview icon={icon} size={58} />
                {locked ? (
                  <View style={[styles.lockBadge, styles.iconLock]}>
                    <Icon name="lock" size={11} color={colors.onAccent} />
                  </View>
                ) : null}
              </View>
              <Text style={[styles.iconLabel, selected && styles.iconLabelSelected]} numberOfLines={1}>
                {name}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {ALTERNATE_ICONS_SUPPORTED ? null : (
        <Text style={styles.note}>{t(Platform.OS === 'web' ? 'themes.icon.web' : 'themes.icon.unsupported')}</Text>
      )}
    </View>
  );
}

const styles = themedStyles(() => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
    marginBottom: -8,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    letterSpacing: -0.6,
    color: colors.text,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  autoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginTop: 4,
  },
  autoSwatches: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.line,
    transform: [{ rotate: '45deg' }],
  },
  autoHalf: {
    flex: 1,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  sectionHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: -8,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  card: {
    width: '48.5%',
    padding: 6,
    gap: 8,
    borderRadius: radius.card + 2,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.8,
  },
  lockBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.line,
  },
  iconSection: {
    gap: 12,
  },
  icons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 14,
    marginHorizontal: -4,
  },
  iconOption: {
    width: '25%',
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 6,
  },
  iconRing: {
    padding: 3,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconRingSelected: {
    borderColor: colors.accent,
  },
  iconLock: {
    top: -2,
    right: -2,
    width: 22,
    height: 22,
  },
  iconLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
  iconLabelSelected: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSubtle,
  },
}));
