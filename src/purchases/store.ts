import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import * as backend from './backend';
import { entitlementsOf, isProductId, PRODUCT_IDS, type Entitlement, type ProductId } from './catalog';

/**
 * Acquisti in-app. Su iOS e Android passano da RevenueCat (vedi `backend.ts`); sul web non si
 * compra, ma un'anteprima si sblocca con una password (vedi `backend.web.ts`).
 *
 * Senza chiavi di RevenueCat (sviluppo, Expo Go) sono **simulati**: comprare riesce sempre e
 * l'acquisto resta salvato sul dispositivo.
 *
 * L'ultimo elenco noto si salva sul dispositivo, così all'avvio (anche offline) temi e
 * niente-pubblicità valgono subito; poi la risposta dello store lo sostituisce.
 *
 * Il resto dell'app legge i diritti da `useEntitlements`.
 */
export const purchasesMode = backend.mode;
export const PURCHASES_SIMULATED = backend.mode === 'simulated';
/** Sul web: si può sbloccare l'anteprima con la password. */
export const webPreviewAvailable = backend.mode === 'webPreview' && backend.previewAvailable;

const STORAGE_KEY = 'pokedex.purchases';

type Prices = Partial<Record<ProductId, string>>;
type State = { loaded: boolean; owned: ProductId[]; prices: Prices };

let state: State = { loaded: false, owned: [], prices: {} };
const listeners = new Set<() => void>();
/** Lo store ha già risposto: il salvataggio locale, se arriva dopo, è vecchio. */
let storeAnswered = false;

function emit(next: State) {
  state = next;
  listeners.forEach((listener) => listener());
}

function save(owned: ProductId[]) {
  const sorted = PRODUCT_IDS.filter((id) => owned.includes(id));
  emit({ ...state, loaded: true, owned: sorted });
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sorted)).catch(() => {});
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((saved) => {
    if (storeAnswered) return;
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    const owned = Array.isArray(parsed) ? PRODUCT_IDS.filter((id) => parsed.includes(id)) : [];
    emit({ ...state, loaded: true, owned });
  })
  .catch(() => emit({ ...state, loaded: true }));

backend.start((owned) => {
  storeAnswered = true;
  save(owned.filter(isProductId));
});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Compra un prodotto. Risolve `true` se è andato a buon fine, `false` se l'utente ha annullato;
 * rigetta se lo store non risponde o rifiuta il pagamento.
 */
export async function purchase(id: ProductId): Promise<boolean> {
  if (PURCHASES_SIMULATED) {
    await delay(700);
    if (!state.owned.includes(id)) save([...state.owned, id]);
    return true;
  }
  const owned = await backend.purchase(id);
  if (!owned) return false;
  storeAnswered = true;
  save(owned);
  return owned.includes(id);
}

/** Ripristina gli acquisti fatti con lo stesso account dello store. Risolve quanti ne ha trovati. */
export async function restore(): Promise<number> {
  if (PURCHASES_SIMULATED) {
    await delay(700);
    return state.owned.length;
  }
  const owned = await backend.restore();
  storeAnswered = true;
  save(owned);
  return owned.length;
}

/** Solo web: con la password giusta sblocca tutto in questo browser. Risolve se era giusta. */
export async function unlockWebPreview(password: string): Promise<boolean> {
  const ok = await backend.unlockPreview(password);
  if (ok) save(PRODUCT_IDS);
  return ok;
}

/** Solo per prove: toglie tutti gli acquisti simulati (o l'anteprima web). */
export function resetSimulatedPurchases() {
  if (backend.mode !== 'store') save([]);
}

let pricesRequested = false;

function requestPrices() {
  if (pricesRequested) return;
  pricesRequested = true;
  backend
    .loadPrices()
    .then((prices) => emit({ ...state, prices }))
    // Si riprova alla prossima apertura del negozio (es. tornata la rete).
    .catch(() => {
      pricesRequested = false;
    });
}

export function usePurchases() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { loaded: current.loaded, owned: current.owned };
}

/** Prezzi dello store nella valuta dell'utente; `undefined` finché non arrivano. */
export function usePrices() {
  useEffect(requestPrices, []);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot).prices;
}

/** I diritti sbloccati dagli acquisti: `has('noAds')`, `has('styles')`, `has('pro')`, `has('deviceTheme')`. */
export function useEntitlements() {
  const { loaded, owned } = usePurchases();
  const entitlements = entitlementsOf(owned);
  return { loaded, entitlements, has: (entitlement: Entitlement) => entitlements.has(entitlement) };
}
