import Constants, { ExecutionEnvironment } from 'expo-constants';

import { adsConfig } from './config';

type AdsModule = typeof import('react-native-google-mobile-ads');

/**
 * Il modulo AdMob, o `null` dove non c'è: Expo Go non include il codice nativo di
 * AdMob e importarlo lì farebbe crashare l'app, quindi serve una development build.
 */
export const nativeAds: AdsModule | null =
  adsConfig.enabled && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('react-native-google-mobile-ads')
    : null;
