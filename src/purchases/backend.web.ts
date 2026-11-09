import type { ProductId } from './catalog';
import type { PurchaseOutcome, PurchasesMode } from './backend';

/**
 * Versione web (GitHub Pages): non si compra niente. Temi, icone e funzioni a pagamento restano
 * bloccati, ma con la password dell'anteprima si sbloccano tutti in questo browser.
 *
 * È solo un cancello leggero: la build contiene l'impronta SHA-256 della password
 * (`EXPO_PUBLIC_WEB_PREVIEW_PASSWORD_SHA256`, calcolata dal workflow dal segreto
 * `WEB_PREVIEW_PASSWORD`), non la password. In sviluppo locale gli acquisti sono simulati.
 */

const passwordHash = process.env.EXPO_PUBLIC_WEB_PREVIEW_PASSWORD_SHA256?.trim().toLowerCase();

export const mode: PurchasesMode = __DEV__ ? 'simulated' : 'webPreview';

/** C'è una password con cui sbloccare l'anteprima. */
export const previewAvailable = !!passwordHash;

export function start(_onChange: (owned: ProductId[]) => void) {}

export async function loadPrices(): Promise<Partial<Record<ProductId, string>>> {
  return {};
}

export async function purchase(_id: ProductId): Promise<PurchaseOutcome> {
  throw new Error('Purchases are not available on the web');
}

export async function restore(): Promise<ProductId[]> {
  return [];
}

async function sha256(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** `true` se la password è giusta: allora vale come avere tutti i prodotti. */
export async function unlockPreview(password: string): Promise<boolean> {
  if (!passwordHash || !password) return false;
  return (await sha256(password)) === passwordHash;
}
