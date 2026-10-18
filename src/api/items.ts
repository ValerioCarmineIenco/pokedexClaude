import { fetchJson } from '@/api/client';
import itemIndex from '@/data/itemIndex.json';
import type { ItemResponse } from '@/types/pokeapi';
import { ITEM_CATEGORIES, type Item, type ItemCategory, type ItemIndexEntry, type ItemPage } from '@/types/item';
import { perLanguage, t } from '@/i18n';
import { localName } from '@/i18n/names';
import { formatName } from '@/utils/format';
import { cleanText, latestLocalizedFlavor, localized } from '@/utils/pokeapiText';
import { normalizeSearch } from '@/utils/search';

export const ITEM_PAGE_SIZE = 20;
export const MAX_RELATED_ITEMS = 5;

const SPRITE_BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items';

/**
 * Oggetti mostrati nell'app, raggruppati per categoria nell'ordine di `ITEM_CATEGORIES` e,
 * dentro ogni categoria, in ordine di id: l'elenco completo scorre una categoria dopo l'altra.
 * Generato da `scripts/generate-item-index.mjs`: solo categorie utili e con immagine.
 */
const INDEX = (itemIndex as ItemIndexEntry[])
  .slice()
  .sort(
    (a, b) =>
      ITEM_CATEGORIES.indexOf(a.category) - ITEM_CATEGORIES.indexOf(b.category) || a.id - b.id,
  );
const BY_ID = new Map(INDEX.map((entry) => [entry.id, entry]));

/** Nome dell'oggetto nella lingua in uso, dall'indice (senza chiamate). */
export function getItemLabel(entry: ItemIndexEntry): string {
  return localName('item', entry.id, entry.label);
}

/**
 * Testo su cui cerca `search`: nome nella lingua in uso e slug inglese («pozione potion»).
 * Ricalcolato al cambio di lingua.
 */
const searchText = perLanguage(
  () =>
    new Map(
      INDEX.map((entry) => [
        entry.id,
        normalizeSearch(`${getItemLabel(entry)} ${entry.name.replace(/-/g, ' ')}`),
      ]),
    ),
);

/**
 * Voci dell'indice, eventualmente di una sola categoria e/o il cui nome contiene `search`
 * (anche parziale, senza distinzione di maiuscole e accenti). Nessuna chiamata di rete:
 * trova anche gli oggetti non ancora caricati.
 */
export function getItemIndex(category?: ItemCategory, search = ''): ItemIndexEntry[] {
  const needle = normalizeSearch(search);
  if (!category && !needle) return INDEX;
  const texts = searchText();
  return INDEX.filter(
    (entry) =>
      (!category || entry.category === category) &&
      (!needle || texts.get(entry.id)!.includes(needle)),
  );
}

export function getItemIndexEntry(id: number): ItemIndexEntry | undefined {
  return BY_ID.get(id);
}

/** Sprite costruito dall'indice, senza chiamate: utile per mostrare l'immagine prima dei dati. */
export function getItemImageUrl(entry: ItemIndexEntry): string {
  return `${SPRITE_BASE_URL}/${entry.sprite ?? entry.name}.png`;
}

/**
 * Fino a 5 oggetti simili: i più vicini per id nella stessa categoria PokéAPI
 * (es. Pozione → Superpozione, Iperpozione…), poi, se non bastano, nella stessa `category`.
 */
export function getRelatedIds(id: number): number[] {
  const entry = BY_ID.get(id);
  if (!entry) return [];
  const byDistance = (a: ItemIndexEntry, b: ItemIndexEntry) =>
    Math.abs(a.id - id) - Math.abs(b.id - id) || a.id - b.id;
  const others = INDEX.filter((e) => e.id !== id && e.category === entry.category);
  const sameGroup = others.filter((e) => e.group === entry.group).sort(byDistance);
  const sameCategory = others.filter((e) => e.group !== entry.group).sort(byDistance);
  return [...sameGroup, ...sameCategory].slice(0, MAX_RELATED_ITEMS).map((e) => e.id);
}

/** Converte il parametro di rotta (`"17"`) in un id dell'indice, altrimenti null. */
export function parseItemId(value: string | string[] | number | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  return Number.isInteger(id) && BY_ID.has(id) ? id : null;
}

/** Id degli oggetti di una pagina (da 0), senza chiamate. */
export function getItemPageIds(page: number, category?: ItemCategory, search?: string): number[] {
  const start = page * ITEM_PAGE_SIZE;
  return getItemIndex(category, search)
    .slice(start, start + ITEM_PAGE_SIZE)
    .map((entry) => entry.id);
}

/** Pagina successiva a `page`, null se è l'ultima. */
export function getNextItemPage(
  page: number,
  category?: ItemCategory,
  search?: string,
): number | null {
  return (page + 1) * ITEM_PAGE_SIZE < getItemIndex(category, search).length ? page + 1 : null;
}

export function toItem(raw: ItemResponse): Item {
  const entry = BY_ID.get(raw.id);
  const name = localized(raw.names)?.name ?? (entry ? getItemLabel(entry) : formatName(raw.name));
  const description =
    latestLocalizedFlavor(raw.flavor_text_entries) ??
    cleanText(localized(raw.effect_entries)?.short_effect ?? '');
  return {
    id: raw.id,
    name,
    description,
    imageUrl: raw.sprites.default ?? (entry ? getItemImageUrl(entry) : ''),
    category: entry?.category ?? 'other',
    relatedIds: getRelatedIds(raw.id),
  };
}

/** Dettaglio di un oggetto. */
export async function getItem(id: number, signal?: AbortSignal): Promise<Item> {
  const raw = await fetchJson<ItemResponse>(`/item/${id}`, signal, t('items:errors.notFound'));
  return toItem(raw);
}

/** Una pagina dell'elenco (da 0), con i dati completi di ogni oggetto. */
export async function getItems(
  page = 0,
  { category, signal }: { category?: ItemCategory; signal?: AbortSignal } = {},
): Promise<ItemPage> {
  const items = await Promise.all(getItemPageIds(page, category).map((id) => getItem(id, signal)));
  return {
    items,
    nextPage: getNextItemPage(page, category),
    total: getItemIndex(category).length,
  };
}

/** Gli oggetti correlati di `id` (al massimo 5), con i dati completi. */
export async function getRelatedItems(id: number, signal?: AbortSignal): Promise<Item[]> {
  return Promise.all(getRelatedIds(id).map((relatedId) => getItem(relatedId, signal)));
}
