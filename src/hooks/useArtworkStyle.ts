import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import { DEFAULT_ARTWORK_STYLE, isArtworkStyle, type ArtworkStyle } from '@/api/pokemon';

const STORAGE_KEY = 'pokedex.artworkStyle';

// Impostazione globale condivisa da elenco, scheda e Impostazioni: un solo valore in memoria,
// letto da disco all'avvio e salvato a ogni cambio.
let current: ArtworkStyle = DEFAULT_ARTWORK_STYLE;
const listeners = new Set<() => void>();

function emit(value: ArtworkStyle) {
  current = value;
  listeners.forEach((listener) => listener());
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((saved) => {
    if (isArtworkStyle(saved) && saved !== current) emit(saved);
  })
  .catch(() => {});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => current;

export function setArtworkStyle(style: ArtworkStyle) {
  emit(style);
  AsyncStorage.setItem(STORAGE_KEY, style).catch(() => {});
}

/** Stile dell'artwork principale (Impostazioni), ricordato tra un'apertura e l'altra. */
export function useArtworkStyle() {
  const style = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return [style, setArtworkStyle] as const;
}
