import type { AdsState } from './consent';

/** Sul web AdMob non esiste: niente annunci e niente consenso da chiedere. */
const state: AdsState = { adsReady: false, privacyOptionsRequired: false };

export function useAdsState() {
  return state;
}

export async function startAds() {}

export async function showAdsPrivacyOptions() {}
