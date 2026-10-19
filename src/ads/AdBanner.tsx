import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';

import { adsConfig } from './config';
import { nativeAds } from './nativeAds';

/**
 * Banner fisso in fondo allo schermo, sotto i contenuti (non li copre: le schermate
 * finiscono sopra di lui). Sta sopra la barra di sistema grazie al margine sicuro.
 */
export function AdBanner() {
  const insets = useSafeAreaInsets();
  if (!nativeAds) return null;
  const { BannerAd, BannerAdSize } = nativeAds;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <BannerAd unitId={adsConfig.unitIds.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
});
