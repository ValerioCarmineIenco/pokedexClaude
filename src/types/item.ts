// Oggetti della borsa (v2). Contratto condiviso con le schermate «Oggetti».

export const ITEM_CATEGORIES = [
  'remedies',
  'tm',
  'megaStones',
  'pokeballs',
  'battle',
  'berries',
  'evolution',
  'other',
] as const;

/**
 * Categoria dell'app, ricavata dalla categoria PokéAPI dell'oggetto
 * (la tabella completa è `CATEGORY_MAP` in `scripts/generate-item-index.mjs`):
 * - `remedies`: tasca Rimedi (cure, PP, revitalizzanti, stati, vitamine);
 * - `tm`: MT, MN e DT;
 * - `megaStones`: megapietre;
 * - `pokeballs`: tutte le Poké Ball, comprese quelle Ghicocca;
 * - `battle`: strumenti da usare o da tenere in lotta (X Attacco, Avanzi, Lastre, Cristalli Z…);
 * - `berries`: bacche;
 * - `evolution`: pietre e strumenti evolutivi;
 * - `other`: il resto della tasca Strumenti (oggetti da vendere, fossili, Ali, Strumenti
 *   allenamento, fertilizzanti…).
 */
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  remedies: 'Rimedi',
  tm: 'MT',
  megaStones: 'Megapietre',
  pokeballs: 'Poké Ball',
  battle: 'Strumenti lotta',
  berries: 'Bacche',
  evolution: 'Evolutivi',
  other: 'Altri strumenti',
};

/** Voce dell'indice incluso nell'app (`src/data/itemIndex.json`). */
export type ItemIndexEntry = {
  id: number;
  /** Slug di PokéAPI (es. `potion`). */
  name: string;
  /** Categoria PokéAPI (es. `healing`). */
  group: string;
  category: ItemCategory;
  /** Nome del file immagine, solo se diverso da `name` (es. `tm-normal`). */
  sprite?: string;
};

/** Dati di `/item/{id}`, pronti per lista, griglia e dettaglio. */
export type Item = {
  id: number;
  /** Nome italiano (es. «Pozione»), altrimenti inglese. */
  name: string;
  /** Ultima descrizione italiana dei giochi, altrimenti inglese; stringa vuota se assente. */
  description: string;
  /** Sprite PokéAPI: pixel art piccola, da ingrandire nel riquadro quadrato. */
  imageUrl: string;
  category: ItemCategory;
  /** Al massimo 5 oggetti simili: prima della stessa categoria PokéAPI, poi della stessa `category`. */
  relatedIds: number[];
};

/** Una pagina di `getItems`. */
export type ItemPage = {
  items: Item[];
  /** Pagina successiva, null se è l'ultima. */
  nextPage: number | null;
  /** Oggetti totali dell'elenco (della categoria, se filtrato). */
  total: number;
};
