import { LinearGradient } from 'expo-linear-gradient';
import { Pressable } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { getActiveTheme, mixColors, radius } from '@/theme/colors';
import { themedStyles } from '@/theme/styles';

import { AppText } from './AppText';

type Props = {
  label: string;
  icon: IconName;
  /** Colore pieno della sezione; la sfumatura verso il basso la calcola il tema. */
  color: string;
  onPress?: () => void;
};

/** Riquadro colorato di una sezione (schermata Altro): icona in alto, nome in Anton in basso. */
export function CategoryTile({ label, icon, color, onPress }: Props) {
  const { cardShade, cardShadeAmount } = getActiveTheme().palette;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      <LinearGradient
        colors={[color, mixColors(color, cardShade, 1 - cardShadeAmount)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fill}
      />
      <Icon name={icon} size={26} color="#FFFFFF" />
      <AppText variant="heading" color="#FFFFFF" numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = themedStyles(() => ({
  tile: {
    flex: 1,
    minHeight: 120,
    borderRadius: radius.tile,
    overflow: 'hidden',
    padding: 16,
    justifyContent: 'space-between',
  },
  pressed: { opacity: 0.85 },
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
}));
