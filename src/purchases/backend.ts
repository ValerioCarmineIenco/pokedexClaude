import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  PRODUCT_CATEGORY,
  type CustomerInfo,
  type PurchasesError,
  type PurchasesStoreProduct,
} from 'react-native-purchases';

import { isProductId, PRODUCT_IDS, type ProductId } from './catalog';

/**
 * Acquisti veri tramite RevenueCat (`react-native-purchases`), su iOS e Android.
 *
 * Configurazione su RevenueCat: un entitlement per prodotto, con lo **stesso identificatore**
 * del prodotto (`pokedex_pro`, `remove_ads`, `style_pack`, `device_theme`), ognuno collegato
 * al suo prodotto dell'App Store e di Google Play. Cosa sblocca ogni prodotto nell'app lo
 * decide `catalog.ts`, non RevenueCat. Un rimborso toglie l'entitlement e quindi l'acquisto.
 *
 * Le chiavi pubbliche dell'SDK (fatte per stare nell'app) arrivano da `.env` o dai segreti
 * di EAS: `EXPO_PUBLIC_REVENUECAT_IOS_KEY` e `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`. Senza
 * chiave gli acquisti restano simulati, per provare l'app in sviluppo.
 */

const apiKey = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

export type PurchasesMode = 'store' | 'simulated' | 'webPreview';

export const mode: PurchasesMode = apiKey ? 'store' : 'simulated';

/** Solo sul web: c'è una password con cui sbloccare l'anteprima. */
export const previewAvailable = false;

/** Esito di un acquisto: i prodotti posseduti dopo, o `null` se l'utente ha annullato. */
export type PurchaseOutcome = ProductId[] | null;

function ownedFrom(info: CustomerInfo): ProductId[] {
  return Object.keys(info.entitlements.active).filter(isProductId);
}

let configured = false;

/** Collega RevenueCat e avvisa a ogni cambio (acquisto, rimborso, ripristino, altro dispositivo). */
export function start(onChange: (owned: ProductId[]) => void) {
  if (!apiKey || configured) return;
  configured = true;
  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey });
  Purchases.addCustomerInfoUpdateListener((info) => onChange(ownedFrom(info)));
  // Funziona anche offline, dall'ultima risposta salvata dall'SDK.
  Purchases.getCustomerInfo()
    .then((info) => onChange(ownedFrom(info)))
    .catch(() => {});
}

const storeProducts = new Map<ProductId, PurchasesStoreProduct>();

/** Prezzi nella valuta dell'utente, come li mostra lo store. */
export async function loadPrices(): Promise<Partial<Record<ProductId, string>>> {
  if (!configured) return {};
  const products = await Purchases.getProducts(PRODUCT_IDS, PRODUCT_CATEGORY.NON_SUBSCRIPTION);
  const prices: Partial<Record<ProductId, string>> = {};
  for (const product of products) {
    if (!isProductId(product.identifier)) continue;
    storeProducts.set(product.identifier, product);
    prices[product.identifier] = product.priceString;
  }
  return prices;
}

/** Compra con il foglio di pagamento dello store. Errori veri (rete, store) rigettano. */
export async function purchase(id: ProductId): Promise<PurchaseOutcome> {
  if (!storeProducts.has(id)) await loadPrices();
  const product = storeProducts.get(id);
  if (!product) throw new Error(`Product ${id} not available in the store`);
  try {
    const { customerInfo } = await Purchases.purchaseStoreProduct(product);
    return ownedFrom(customerInfo);
  } catch (error) {
    if ((error as PurchasesError).userCancelled) return null;
    throw error;
  }
}

/** Ripristina gli acquisti fatti con lo stesso account dello store. */
export async function restore(): Promise<ProductId[]> {
  const info = await Purchases.restorePurchases();
  return ownedFrom(info);
}

export async function unlockPreview(_password: string): Promise<boolean> {
  return false;
}
