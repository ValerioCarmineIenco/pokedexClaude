import { useIsRestoring } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { PokeBallLogo } from './PokeBallLogo';

/** Tempo minimo della schermata, così non appare e sparisce in un lampo. */
const MIN_DURATION = 1200;

/**
 * Schermata di caricamento iniziale: resta sopra l'app finché la cache salvata
 * non è stata ripristinata (e per almeno MIN_DURATION), poi sfuma via.
 */
export function StartupLoader() {
  const isRestoring = useIsRestoring();
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), MIN_DURATION);
    return () => clearTimeout(timer);
  }, []);

  const ready = minElapsed && !isRestoring;

  return ready ? null : <LoadingScreen />;
}

/** Poké Ball che dondola come durante una cattura, sul rosso dell'icona. */
export function LoadingScreen() {
  const reduceMotion = useReducedMotion();
  const tilt = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    tilt.value = withRepeat(
      withSequence(
        withTiming(-18, { duration: 180 }),
        withTiming(18, { duration: 260 }),
        withTiming(-10, { duration: 220 }),
        withTiming(0, { duration: 160 }),
        withDelay(400, withTiming(0, { duration: 0 })),
      ),
      -1,
    );
  }, [tilt, reduceMotion]);

  const ballStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${tilt.value}deg` }],
  }));

  return (
    <Animated.View
      exiting={FadeOut.duration(300)}
      style={styles.screen}
      accessibilityRole="progressbar"
      accessibilityLabel="Caricamento del Pokédex">
      <StatusBar style="light" />
      <Animated.View style={[styles.ball, ballStyle]}>
        <PokeBallLogo size={112} />
      </Animated.View>
      <Text style={styles.title}>Pokédex</Text>
      <Text style={styles.subtitle}>Caricamento…</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  ball: {
    marginBottom: 28,
    // L'anello bianco stacca la Poké Ball dal fondo rosso.
    borderRadius: 999,
    borderWidth: 6,
    borderColor: colors.surface,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 40,
    color: colors.surface,
  },
  subtitle: {
    marginTop: 6,
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
