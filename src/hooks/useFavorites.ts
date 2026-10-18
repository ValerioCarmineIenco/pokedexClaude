import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'pokedex.favorites';

// Preferiti condivisi da elenco e scheda: un solo insieme di id in memoria,
// letto da disco all'avvio e salvato a ogni cambio.
let current: ReadonlySet<number> = new Set();
const listeners = new Set<() => void>();

function emit(value: ReadonlySet<number>) {
  current = value;
  listeners.forEach((listener) => listener());
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((saved) => {
    if (!saved) return;
    const ids = JSON.parse(saved);
    if (!Array.isArray(ids)) return;
    // Unisce a quelli eventualmente aggiunti prima che la lettura finisse.
    emit(new Set([...ids.filter((id): id is number => Number.isInteger(id)), ...current]));
  })
  .catch(() => {});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => current;

/** Aggiunge il Pokémon ai preferiti, o lo toglie se c'è già. */
export function toggleFavorite(id: number) {
  const next = new Set(current);
  if (!next.delete(id)) next.add(id);
  emit(next);
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next].sort((a, b) => a - b))).catch(() => {});
}

/** Id dei Pokémon preferiti, ricordati tra un'apertura e l'altra. */
export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return [favorites, toggleFavorite] as const;
}
