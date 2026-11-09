import type { TabTriggerSlotProps } from 'expo-router/ui';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { AppText } from '@/components/ui';
import { colors, radius } from '@/theme/colors';
import { themedStyles } from '@/theme/styles';

/** Altezza della barra in basso, senza margini. */
export const TAB_BAR_HEIGHT = 60;
/** Distanza minima tra la barra e il bordo inferiore dello schermo. */
const TAB_BAR_GAP = 12;

/** Distanza della barra dal fondo: sopra la barra di sistema (home indicator) se c'è. */
export function tabBarBottom(safeBottom: number): number {
  return Math.max(safeBottom, TAB_BAR_GAP) + (safeBottom > 0 ? 4 : 0);
}

/**
 * Spazio da lasciare in fondo agli elenchi delle schermate con la barra, perché l'ultimo
 * elemento non finisca sotto di lei (la barra galleggia sopra i contenuti).
 */
export function useTabBarInset(): number {
  const insets = useSafeAreaInsets();
  return tabBarBottom(insets.bottom) + TAB_BAR_HEIGHT + 16;
}

type ButtonProps = TabTriggerSlotProps & {
  label: string;
  /** Icona della sezione; senza, la Poké Ball del Pokédex. */
  icon?: IconName;
};

/**
 * Pulsante della barra in basso. La sezione aperta è una pillola piena con icona e nome; le
 * altre mostrano solo l'icona (il nome resta per lo screen reader).
 */
export function TabBarButton({ label, icon, isFocused, style, ...rest }: ButtonProps) {
  const tint = isFocused ? colors.onSelected : colors.textMuted;
  return (
    <Pressable
      {...rest}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!isFocused }}
      style={(state) => [
        styles.button,
        isFocused && styles.buttonActive,
        state.pressed && !isFocused && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}>
      {icon ? (
        <Icon name={icon} size={22} color={tint} />
      ) : (
        <PokeBallGlyph
          size={22}
          color={tint}
          fill={isFocused ? colors.selected : colors.surface}
        />
      )}
      {isFocused && (
        <AppText variant="bodyStrong" color={tint} numberOfLines={1}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

/** Poké Ball stilizzata a una tinta, come le altre icone della barra. */
function PokeBallGlyph({ size, color, fill }: { size: number; color: string; fill: string }) {
  const stroke = Math.max(2, Math.round(size / 10));
  const center = Math.round(size * 0.38);
  return (
    <View
      style={[
        styles.ball,
        { width: size, height: size, borderRadius: size / 2, borderWidth: stroke, borderColor: color },
      ]}>
      <View style={[styles.ballBand, { height: stroke, backgroundColor: color }]} />
      <View
        style={{
          width: center,
          height: center,
          borderRadius: center / 2,
          borderWidth: stroke,
          borderColor: color,
          backgroundColor: fill,
        }}
      />
    </View>
  );
}

/** Stile della barra (il `TabList`): pillola che galleggia sopra le schermate. */
export const tabBarStyles = themedStyles(() => ({
  bar: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: TAB_BAR_HEIGHT,
    padding: 6,
    gap: 4,
    alignItems: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    ...Platform.select({
      web: { boxShadow: '0 10px 30px rgba(0, 0, 0, 0.22)' },
      default: {
        shadowColor: '#000000',
        shadowOpacity: 0.22,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
      },
    }),
  },
}));

const styles = themedStyles(() => ({
  button: {
    height: '100%',
    minWidth: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
  },
  buttonActive: {
    paddingLeft: 16,
    paddingRight: 20,
    backgroundColor: colors.selected,
  },
  pressed: { opacity: 0.6 },
  ball: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ballBand: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
}));
