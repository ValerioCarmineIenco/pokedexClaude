import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { ViewMode } from '@/hooks/useViewMode';
import { colors } from '@/theme/colors';

import { GRID_CARD_HEIGHT, ROW_CARD_HEIGHT } from './PokemonCard';

/** Blocco grigio che pulsa piano mentre i dati arrivano (fermo se l'utente riduce le animazioni). */
export function SkeletonBlock({
  width,
  height,
  radius = 6,
  style,
}: {
  width: DimensionValue;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withRepeat(withTiming(0.45, { duration: 700 }), -1, true);
  }, [opacity, reduceMotion]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: colors.skeletonLine },
        animated,
        style,
      ]}
    />
  );
}

/** Carta "scheletro" con la stessa forma di quelle vere. */
export function SkeletonCard({ variant }: { variant: ViewMode }) {
  if (variant === 'row') {
    return (
      <View style={[styles.card, styles.row]}>
        <SkeletonBlock width={52} height={52} radius={26} />
        <View style={styles.rowText}>
          <SkeletonBlock width={36} height={9} />
          <SkeletonBlock width="55%" height={13} />
        </View>
        <SkeletonBlock width={56} height={16} radius={999} />
      </View>
    );
  }
  return (
    <View style={[styles.card, styles.grid]}>
      <SkeletonBlock width="30%" height={9} />
      <SkeletonBlock width="65%" height={13} />
      <View style={styles.spacer} />
      <SkeletonBlock width="40%" height={16} radius={999} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.skeleton,
    borderRadius: 16,
  },
  grid: {
    height: GRID_CARD_HEIGHT,
    padding: 12,
    gap: 8,
  },
  row: {
    height: ROW_CARD_HEIGHT,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    flex: 1,
    gap: 6,
  },
  spacer: {
    flex: 1,
  },
});
