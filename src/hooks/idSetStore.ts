import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

/**
 * Insieme di id di Pokémon condiviso da elenco e scheda (preferiti, shiny ottenuti…):
 * un solo valore in memoria, letto da disco all'avvio e salvato a ogni cambio.
 */
export function createIdSetStore(storageKey: string) {
  let current: ReadonlySet<number> = new Set();
  const listeners = new Set<() => void>();

  function emit(value: ReadonlySet<number>) {
    current = value;
    listeners.forEach((listener) => listener());
  }

  AsyncStorage.getItem(storageKey)
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

  function save(next: ReadonlySet<number>) {
    emit(next);
    AsyncStorage.setItem(storageKey, JSON.stringify([...next].sort((a, b) => a - b))).catch(() => {});
  }

  /** Aggiunge l'id, o lo toglie se c'è già. */
  function toggle(id: number) {
    const next = new Set(current);
    if (!next.delete(id)) next.add(id);
    save(next);
  }

  /** Sostituisce tutti gli id (ripristino di un backup). */
  function replace(ids: Iterable<number>) {
    save(new Set(ids));
  }

  function useIds() {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  }

  return { toggle, replace, getIds: getSnapshot, useIds };
}
