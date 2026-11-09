/**
 * Prodotti in vendita (2.0), tutti acquisti una tantum (non consumabili). Gli `id` sono quelli
 * da creare, identici, su App Store Connect, Google Play Console e RevenueCat; i prezzi qui sono
 * solo un ripiego, quelli veri (nella valuta dell'utente) li dà lo store.
 */

/** Cosa sblocca un acquisto. Più prodotti possono dare lo stesso diritto. */
export type Entitlement = 'noAds' | 'styles' | 'pro' | 'deviceTheme';

export type ProductId = 'pokedex_pro' | 'remove_ads' | 'style_pack' | 'device_theme';

export type Product = {
  id: ProductId;
  entitlements: Entitlement[];
  /** Prezzo di ripiego, finché lo store non risponde (e nella versione simulata). */
  fallbackPrice: string;
  /** Il prodotto da mettere in evidenza. */
  highlighted?: boolean;
};

export const PRODUCTS: Product[] = [
  // Pro include tutto tranne il tema Dispositivo, che si compra a parte.
  { id: 'pokedex_pro', entitlements: ['noAds', 'styles', 'pro'], fallbackPrice: '5,99 €', highlighted: true },
  { id: 'remove_ads', entitlements: ['noAds'], fallbackPrice: '2,99 €' },
  { id: 'style_pack', entitlements: ['styles'], fallbackPrice: '1,99 €' },
  { id: 'device_theme', entitlements: ['deviceTheme'], fallbackPrice: '2,99 €' },
];

export const PRODUCT_IDS = PRODUCTS.map((product) => product.id);

export function isProductId(value: unknown): value is ProductId {
  return PRODUCT_IDS.includes(value as ProductId);
}

export function entitlementsOf(owned: readonly ProductId[]): Set<Entitlement> {
  return new Set(PRODUCTS.filter((product) => owned.includes(product.id)).flatMap((product) => product.entitlements));
}

/** Un prodotto è «già tuo» se hai tutto quello che sblocca, anche tramite un altro (es. Pro). */
export function isUnlocked(product: Product, entitlements: ReadonlySet<Entitlement>) {
  return product.entitlements.every((entitlement) => entitlements.has(entitlement));
}
