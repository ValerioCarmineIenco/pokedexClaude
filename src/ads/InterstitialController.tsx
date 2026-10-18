import { usePathname, useSegments } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { adsConfig } from './config';
import { initAds } from './initAds';
import { createInterstitialPolicy } from './interstitialPolicy';
import { nativeAds } from './nativeAds';

/**
 * Mostra un interstiziale dopo 30 minuti nell'app o dopo 30 schede dettaglio
 * (vedi `adsConfig`), il primo dei due; poi si riparte da zero con entrambi.
 * L'annuncio compare solo al cambio schermata, mai a metà di un'azione: se è
 * "ora" mentre si sta su una schermata, aspetta la prossima.
 */
// Uno solo per tutta la sessione: il tempo parte all'apertura dell'app.
const policy = createInterstitialPolicy(adsConfig.interstitial, Date.now());

export function InterstitialController() {
  return nativeAds ? <Interstitial ads={nativeAds} /> : null;
}

function Interstitial({ ads }: { ads: NonNullable<typeof nativeAds> }) {
  const [sdkReady, setSdkReady] = useState(false);
  const { status, show, load } = ads.useInterstitialAd({
    adUnitId: adsConfig.unitIds.interstitial,
    autoLoad: sdkReady,
  });
  const route = useSegments().join('/');
  // Il percorso completo cambia anche passando da un Pokémon all'altro sulla stessa rotta.
  const screenKey = usePathname();
  const isFirstScreen = useRef(true);

  useEffect(() => {
    void initAds().then(setSdkReady);
  }, []);

  // Il tempo conta solo con l'app in primo piano.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') policy.resume(Date.now());
      else policy.pause(Date.now());
    });
    return () => subscription.remove();
  }, []);

  // Ogni cambio schermata: conta le schede dettaglio e, se è ora, mostra l'annuncio.
  useEffect(() => {
    if (adsConfig.detailRoutes.includes(route)) policy.recordDetailView();
    if (isFirstScreen.current) {
      isFirstScreen.current = false;
      return;
    }
    if (!policy.isDue(Date.now())) return;
    if (status === 'loaded') show();
    // Se l'annuncio non era pronto, ne chiede un altro: andrà alla prossima schermata.
    else if (status === 'error' || status === 'no-fill') load();
    // Solo i cambi schermata fanno partire questo effetto, non i cambi di stato dell'annuncio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenKey]);

  // Mostrato: si azzerano tempo e contatore. Chiuso: si prepara il prossimo.
  useEffect(() => {
    if (status === 'showing') policy.reset(Date.now());
    if (status === 'closed') load();
  }, [status, load]);

  return null;
}
