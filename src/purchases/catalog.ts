/**
 * Prodotti in vendita (2.0). Gli `id` sono quelli da creare, identici, su App Store Connect e
 * Google Play Console; i prezzi qui sono solo un ripiego, quelli veri li dà lo store.
 */

/** Cosa sblocca un acquisto. Più prodotti possono dare lo stesso diritto. */
export type Entitlement = 'noAds' | 'styles';

export type ProductId = 'remove_ads' | 'style_pack' | 'pokedex_pro';

export type Product = {
  id: ProductId;
  entitlements: Entitlement[];
  /** Prezzo di ripiego, finché lo store non risponde (e nella versione simulata). */
  fallbackPrice: string;
  /** Il prodotto da mettere in evidenza. */
  highlighted?: boolean;
};

export const PRODUCTS: Product[] = [
  { id: 'pokedex_pro', entitlements: ['noAds', 'styles'], fallbackPrice: '5,99 €', highlighted: true },
  { id: 'remove_ads', entitlements: ['noAds'], fallbackPrice: '2,99 €' },
  { id: 'style_pack', entitlements: ['styles'], fallbackPrice: '1,99 €' },
];

export function entitlementsOf(owned: readonly ProductId[]): Set<Entitlement> {
  return new Set(PRODUCTS.filter((product) => owned.includes(product.id)).flatMap((product) => product.entitlements));
}
