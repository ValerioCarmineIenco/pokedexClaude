import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import type { AdsConsentInfo, AdsConsentInfoOptions } from 'react-native-google-mobile-ads';

import { adsConfig } from './config';
import { nativeAds } from './nativeAds';

/**
 * Consenso alla pubblicità, prima di qualsiasi annuncio:
 * 1. GDPR: il modulo di Google (UMP) chiede il consenso a chi è nello SEE, nel
 *    Regno Unito e in Svizzera (e negli Stati USA con leggi sulla privacy).
 *    Fuori da lì non compare nulla. La scelta resta salvata sul dispositivo.
 * 2. iOS: la richiesta di sistema di App Tracking Transparency, una volta sola.
 * 3. Solo dopo parte l'SDK di AdMob e si chiedono banner e interstiziali.
 *
 * AdMob legge da solo le scelte (stringa TCF e permesso ATT): se l'utente rifiuta,
 * gli annunci restano ma non sono personalizzati.
 */

export type AdsState = {
  /** Consenso raccolto o non necessario, e SDK avviato: si possono chiedere annunci. */
  adsReady: boolean;
  /** L'utente deve poter rivedere il consenso: c'è la voce nelle Impostazioni. */
  privacyOptionsRequired: boolean;
};

let state: AdsState = { adsReady: false, privacyOptionsRequired: false };
const listeners = new Set<() => void>();

function setState(next: Partial<AdsState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Stato della pubblicità, aggiornato quando cambia il consenso. */
export function useAdsState() {
  return useSyncExternalStore(subscribe, () => state);
}

function consentOptions(): AdsConsentInfoOptions {
  if (!nativeAds) return {};
  const { debugGeography, testDeviceIdentifiers } = adsConfig.consent;
  return {
    debugGeography:
      debugGeography === 'EEA'
        ? nativeAds.AdsConsentDebugGeography.EEA
        : debugGeography === 'other'
          ? nativeAds.AdsConsentDebugGeography.OTHER
          : nativeAds.AdsConsentDebugGeography.DISABLED,
    testDeviceIdentifiers,
  };
}

/** Chiede a UMP lo stato aggiornato e, se serve, mostra il modulo del consenso. */
async function gatherGdprConsent(): Promise<AdsConsentInfo | null> {
  if (!nativeAds) return null;
  const { AdsConsent } = nativeAds;
  try {
    return await AdsConsent.gatherConsent(consentOptions());
  } catch {
    // Senza rete o con il modulo in errore vale la scelta salvata l'ultima volta.
    return AdsConsent.getConsentInfo().catch(() => null);
  }
}

/** Su iOS chiede il permesso di tracciamento, solo se l'utente non ha ancora risposto. */
async function requestTracking() {
  if (Platform.OS !== 'ios') return;
  try {
    const { status } = await getTrackingPermissionsAsync();
    if (status === 'undetermined') await requestTrackingPermissionsAsync();
  } catch {
    // Senza permesso gli annunci restano, solo non personalizzati.
  }
}

let sdkStarted: Promise<boolean> | null = null;

/** Avvia l'SDK di AdMob una volta sola; `false` se non parte. */
function startSdk() {
  sdkStarted ??= nativeAds
    ? nativeAds
        .default()
        .initialize()
        .then(() => true)
        .catch(() => false)
    : Promise.resolve(false);
  return sdkStarted;
}

async function applyConsent(info: AdsConsentInfo | null) {
  setState({
    privacyOptionsRequired:
      info?.privacyOptionsRequirementStatus ===
      nativeAds?.AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
  });
  const canRequestAds = info?.canRequestAds ?? false;
  setState({ adsReady: canRequestAds && (await startSdk()) });
}

let started: Promise<void> | null = null;

/** Consenso GDPR, poi ATT, poi avvio dell'SDK. Una volta sola per sessione. */
export function startAds() {
  started ??= (async () => {
    if (!nativeAds) return;
    const info = await gatherGdprConsent();
    if (info?.canRequestAds) await requestTracking();
    await applyConsent(info);
  })();
  return started;
}

/** Riapre il modulo di Google per cambiare il consenso (voce delle Impostazioni). */
export async function showAdsPrivacyOptions() {
  if (!nativeAds) return;
  const info = await nativeAds.AdsConsent.showPrivacyOptionsForm().catch(() =>
    nativeAds!.AdsConsent.getConsentInfo().catch(() => null)
  );
  await applyConsent(info);
}
