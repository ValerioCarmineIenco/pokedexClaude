import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { colors, radius } from '@/theme/colors';
import { themedStyles } from '@/theme/styles';

import { AppText } from './AppText';

type Props = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  /** `accent`: riquadro dell'icona nel colore d'accento (Premium). */
  tone?: 'neutral' | 'accent';
  onPress?: () => void;
  /** Linea di separazione sopra la riga: tutte tranne la prima di un gruppo. */
  divider?: boolean;
};

/** Riga d'elenco con icona, titolo, sottotitolo e freccia: Temi, Premium, Impostazioni. */
export function ListRow({ title, subtitle, icon, tone = 'neutral', onPress, divider }: Props) {
  const accent = tone === 'accent';
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, divider && styles.divider, pressed && styles.pressed]}>
      {icon && (
        <View style={[styles.iconTile, accent && styles.iconTileAccent]}>
          <Icon name={icon} size={20} color={accent ? colors.onAccent : colors.text} />
        </View>
      )}
      <View style={styles.texts}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="body" color={colors.textMuted} numberOfLines={2}>
            {subtitle}
          </AppText>
        )}
      </View>
      {onPress && <Icon name="next" size={16} color={colors.textMuted} />}
    </Pressable>
  );
}

const styles = themedStyles(() => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.outline,
  },
  iconTile: {
    width: 38,
    height: 38,
    borderRadius: radius.field,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.field === colors.surface ? colors.line : colors.field,
  },
  iconTileAccent: { backgroundColor: colors.accent },
  texts: { flex: 1, gap: 2 },
  pressed: { opacity: 0.7 },
}));
