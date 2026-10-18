import { useIsRestoring } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
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

const BALL = 120;
const HALF = BALL / 2;
const BORDER = 7;
/** Bordo bianco che stacca la metà rossa dal fondo rosso. */
const RIM = 6;

/** Caduta con rimbalzo, tre scosse e il "clic" del pulsante. */
const INTRO_MS = 2450;
/** La Poké Ball si apre e il lampo copre lo schermo. */
const OUTRO_MS = 800;
/** Con le animazioni ridotte la schermata resta solo il minimo indispensabile. */
const REDUCED_MS = 800;

type Phase = 'intro' | 'waiting' | 'outro';

/**
 * Schermata di caricamento iniziale: la Poké Ball cade, rimbalza e si scuote come
 * durante una cattura; quando la cache salvata è stata ripristinata si apre e un
 * lampo lascia il posto all'app.
 */
export function StartupLoader() {
  const isRestoring = useIsRestoring();
  const reduceMotion = useReducedMotion();
  const [introDone, setIntroDone] = useState(false);
  const [done, setDone] = useState(false);

  const phase: Phase = !introDone ? 'intro' : isRestoring ? 'waiting' : 'outro';

  useEffect(() => {
    const timer = setTimeout(() => setIntroDone(true), reduceMotion ? REDUCED_MS : INTRO_MS);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  useEffect(() => {
    if (phase !== 'outro') return;
    const timer = setTimeout(() => setDone(true), reduceMotion ? 250 : OUTRO_MS);
    return () => clearTimeout(timer);
  }, [phase, reduceMotion]);

  return done ? null : <LoadingScreen phase={phase} reduceMotion={reduceMotion} />;
}

const subscribeNothing = () => () => {};

function LoadingScreen({ phase, reduceMotion }: { phase: Phase; reduceMotion: boolean }) {
  const { t } = useTranslation(['pokedex', 'common']);
  // Il sito statico è generato in inglese: i testi compaiono solo nel browser, nella sua lingua,
  // così l'idratazione non trova differenze.
  const isClient = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const { width, height } = useWindowDimensions();
  const drop = useSharedValue(reduceMotion ? 0 : -height * 0.6);
  const tilt = useSharedValue(0);
  const click = useSharedValue(1);
  const titleIn = useSharedValue(reduceMotion ? 1 : 0);
  const lid = useSharedValue(0);
  const flash = useSharedValue(0);
  const fade = useSharedValue(1);

  // Entrata: caduta, titolo, tre scosse alternate e il "clic" finale.
  useEffect(() => {
    if (reduceMotion) return;
    const shake = (angle: number) =>
      withSequence(
        withTiming(angle, { duration: 130, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 130, easing: Easing.in(Easing.quad) }),
        withTiming(0, { duration: 260 }),
      );
    drop.set(withTiming(0, { duration: 600, easing: Easing.bounce }));
    titleIn.set(withDelay(450, withTiming(1, { duration: 400 })));
    tilt.set(withDelay(700, withSequence(shake(-22), shake(22), shake(-22))));
    const pulse = withSequence(withTiming(1.35, { duration: 90 }), withTiming(1, { duration: 100 }));
    click.set(withDelay(2260, pulse));
  }, [reduceMotion, drop, titleIn, tilt, click]);

  // Se la cache non è ancora pronta, la Poké Ball continua a scuotersi piano.
  useEffect(() => {
    if (phase !== 'waiting' || reduceMotion) return;
    const wobble = withSequence(
      withTiming(-12, { duration: 140 }),
      withTiming(12, { duration: 220 }),
      withTiming(0, { duration: 140 }),
      withTiming(0, { duration: 400 }),
    );
    tilt.set(withRepeat(wobble, -1));
  }, [phase, reduceMotion, tilt]);

  // Uscita: la metà superiore si solleva e il lampo riempie lo schermo.
  useEffect(() => {
    if (phase !== 'outro') return;
    if (reduceMotion) {
      fade.set(withTiming(0, { duration: 250 }));
      return;
    }
    tilt.set(withTiming(0, { duration: 80 }));
    lid.set(withTiming(1, { duration: 260, easing: Easing.out(Easing.back(2)) }));
    flash.set(withDelay(120, withTiming(1, { duration: 380, easing: Easing.in(Easing.quad) })));
    fade.set(withDelay(500, withTiming(0, { duration: 300 })));
  }, [phase, reduceMotion, tilt, lid, flash, fade]);

  const screenStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  const ballStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: drop.value }, { rotate: `${tilt.value}deg` }],
  }));
  const lidStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -BALL * 0.32 * lid.value }, { rotate: `${-28 * lid.value}deg` }],
  }));
  // L'ombra a terra cresce mentre la Poké Ball scende e sparisce nel lampo.
  const shadowStyle = useAnimatedStyle(() => {
    const near = 1 + drop.value / (height * 0.6);
    return { opacity: near * (1 - flash.value), transform: [{ scale: 0.4 + 0.6 * near }] };
  });
  const buttonStyle = useAnimatedStyle(() => ({ transform: [{ scale: click.value }] }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleIn.value,
    transform: [{ translateY: (1 - titleIn.value) * 16 }],
  }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value > 0 ? 1 : 0,
    transform: [{ scale: flash.value }],
  }));
  // Il lampo parte dal centro della Poké Ball e deve coprire anche gli angoli.
  const flashSize = Math.hypot(width, height) * 2;

  return (
    <Animated.View
      style={[styles.screen, screenStyle]}
      accessibilityRole="progressbar"
      accessibilityLabel={isClient ? t('common.loading') : undefined}>
      <StatusBar style="light" />
      <View style={styles.stage}>
        <Animated.View style={[styles.ball, ballStyle]}>
          <View style={styles.bottomShell}>
            <View style={styles.bottomHalf} />
          </View>
          <Animated.View style={[styles.topShell, lidStyle]}>
            <View style={styles.topHalf} />
          </Animated.View>
          <View style={styles.band} />
          <Animated.View style={[styles.button, buttonStyle]}>
            <View style={styles.buttonInner} />
          </Animated.View>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.flash,
              {
                width: flashSize,
                height: flashSize,
                borderRadius: flashSize / 2,
                left: HALF - flashSize / 2,
                top: HALF - flashSize / 2,
              },
              flashStyle,
            ]}
          />
        </Animated.View>
        <Animated.View style={[styles.shadow, shadowStyle]} />
      </View>
      <Animated.View style={[styles.titles, titleStyle]}>
        <Text style={styles.title}>{isClient ? t('common:screens.pokedex') : ''}</Text>
        <Text style={styles.subtitle}>{isClient ? t('common.loadingShort') : ''}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    overflow: 'hidden',
  },
  // Sopra i titoli, così il lampo copre anche loro.
  stage: {
    alignItems: 'center',
    zIndex: 1,
  },
  ball: {
    width: BALL,
    height: BALL,
    // La Poké Ball oscilla sulla base, come quando è a terra.
    transformOrigin: 'center bottom',
  },
  topShell: {
    position: 'absolute',
    top: -RIM,
    left: -RIM,
    paddingTop: RIM,
    paddingHorizontal: RIM,
    borderTopLeftRadius: HALF + RIM,
    borderTopRightRadius: HALF + RIM,
    backgroundColor: colors.surface,
    // Si apre sul cardine a sinistra.
    transformOrigin: 'left bottom',
  },
  topHalf: {
    width: BALL,
    height: HALF,
    borderTopLeftRadius: HALF,
    borderTopRightRadius: HALF,
    borderWidth: BORDER,
    borderBottomWidth: 0,
    borderColor: colors.text,
    backgroundColor: colors.accent,
  },
  bottomShell: {
    position: 'absolute',
    bottom: -RIM,
    left: -RIM,
    paddingBottom: RIM,
    paddingHorizontal: RIM,
    borderBottomLeftRadius: HALF + RIM,
    borderBottomRightRadius: HALF + RIM,
    backgroundColor: colors.surface,
  },
  bottomHalf: {
    width: BALL,
    height: HALF,
    borderBottomLeftRadius: HALF,
    borderBottomRightRadius: HALF,
    borderWidth: BORDER,
    borderTopWidth: 0,
    borderColor: colors.text,
    backgroundColor: colors.surface,
  },
  band: {
    position: 'absolute',
    top: HALF - BORDER / 2,
    left: 0,
    width: BALL,
    height: BORDER,
    backgroundColor: colors.text,
  },
  button: {
    position: 'absolute',
    top: HALF - BALL * 0.18,
    left: HALF - BALL * 0.18,
    width: BALL * 0.36,
    height: BALL * 0.36,
    borderRadius: BALL * 0.18,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonInner: {
    width: BALL * 0.2,
    height: BALL * 0.2,
    borderRadius: BALL * 0.1,
    backgroundColor: colors.surface,
  },
  flash: {
    position: 'absolute',
    backgroundColor: colors.background,
  },
  shadow: {
    marginTop: 10 + RIM,
    width: BALL * 0.7,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  titles: {
    marginTop: 26,
    alignItems: 'center',
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
