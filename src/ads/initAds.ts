import { nativeAds } from './nativeAds';

let ready: Promise<boolean> | null = null;

/** Avvia l'SDK di AdMob una volta sola; `false` se non c'è o non parte. */
export function initAds() {
  ready ??= nativeAds
    ? nativeAds
        .default()
        .initialize()
        .then(() => true)
        .catch(() => false)
    : Promise.resolve(false);
  return ready;
}
