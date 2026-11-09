import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/styles';

import { useEntitlements } from '@/purchases/store';

import { adsConfig } from './config';
import { startAds, useAdsState } from './consent';
import { nativeAds } from './nativeAds';

/**
 * Banner fisso in fondo allo schermo, sotto i contenuti (non li copre: le schermate
 * finiscono sopra di lui). Sta sopra la barra di sistema grazie al margine sicuro.
 * Compare solo dopo il consenso (vedi `consent.ts`).
 */
export function AdBanner() {
  const insets = useSafeAreaInsets();
  const entitlements = useEntitlements();
  const noAds = entitlements.has('noAds');
  const { adsReady } = useAdsState();

  // Consenso e SDK solo per chi vede annunci.
  useEffect(() => {
    if (!noAds) void startAds();
  }, [noAds]);

  // «Rimuovi pubblicità» o Pokédex Pro: niente banner.
  if (!nativeAds || noAds || !adsReady) return null;
  const { BannerAd, BannerAdSize } = nativeAds;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <BannerAd unitId={adsConfig.unitIds.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

const styles = themedStyles(() => ({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
}));
