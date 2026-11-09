import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import { entitlementsOf, PRODUCTS, type Entitlement, type ProductId } from './catalog';

/**
 * Acquisti in-app. **Per ora simulati**: comprare riesce sempre dopo un attimo e l'acquisto resta
 * salvato sul dispositivo; «Ripristina» non trova niente di nuovo. Niente passa dagli store.
 *
 * Per quelli veri (consigliato RevenueCat, `react-native-purchases`) si sostituiscono solo
 * `purchase` e `restore` con le chiamate alla libreria, e `owned` con i prodotti che restituisce:
 * il resto dell'app legge i diritti da `useEntitlements` e non cambia.
 */
export const PURCHASES_SIMULATED = true;

const STORAGE_KEY = 'pokedex.purchases';

type State = { loaded: boolean; owned: ProductId[] };

let state: State = { loaded: false, owned: [] };
const listeners = new Set<() => void>();

function emit(next: State) {
  state = next;
  listeners.forEach((listener) => listener());
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((saved) => {
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    const owned = Array.isArray(parsed)
      ? PRODUCTS.map((product) => product.id).filter((id) => parsed.includes(id))
      : [];
    emit({ loaded: true, owned });
  })
  .catch(() => emit({ ...state, loaded: true }));

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;

function save(owned: ProductId[]) {
  emit({ ...state, owned });
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(owned)).catch(() => {});
}

/** Compra un prodotto. Risolve `true` se è andato a buon fine, `false` se annullato. */
export async function purchase(id: ProductId): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (!state.owned.includes(id)) save([...state.owned, id]);
  return true;
}

/** Ripristina gli acquisti fatti con lo stesso account dello store. Risolve quanti ne ha trovati. */
export async function restore(): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return state.owned.length;
}

/** Solo per prove: toglie tutti gli acquisti simulati. */
export function resetSimulatedPurchases() {
  save([]);
}

export function usePurchases() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { loaded: current.loaded, owned: current.owned };
}

/** I diritti sbloccati dagli acquisti: `has('noAds')`, `has('styles')`. */
export function useEntitlements() {
  const { loaded, owned } = usePurchases();
  const entitlements = entitlementsOf(owned);
  return { loaded, has: (entitlement: Entitlement) => entitlements.has(entitlement) };
}
