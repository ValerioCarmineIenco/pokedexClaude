import { fetchJson } from '@/api/client';
import itemIndex from '@/data/itemIndex.json';
import type { ItemResponse, NamedAPIResource } from '@/types/pokeapi';
import type { Item, ItemCategory, ItemIndexEntry, ItemPage } from '@/types/item';
import { formatName } from '@/utils/format';

export const ITEM_PAGE_SIZE = 20;
export const MAX_RELATED_ITEMS = 5;

const SPRITE_BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items';

/**
 * Oggetti mostrati nell'app, in ordine di id (come nei giochi: prima le Poké Ball, poi i
 * rimedi…). Generato da `scripts/generate-item-index.mjs`: solo categorie utili e con immagine.
 */
const INDEX = itemIndex as ItemIndexEntry[];
const BY_ID = new Map(INDEX.map((entry) => [entry.id, entry]));

/** Voci dell'indice, eventualmente di una sola categoria. */
export function getItemIndex(category?: ItemCategory): ItemIndexEntry[] {
  return category ? INDEX.filter((entry) => entry.category === category) : INDEX;
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
export function getItemPageIds(page: number, category?: ItemCategory): number[] {
  const start = page * ITEM_PAGE_SIZE;
  return getItemIndex(category)
    .slice(start, start + ITEM_PAGE_SIZE)
    .map((entry) => entry.id);
}

/** Pagina successiva a `page`, null se è l'ultima. */
export function getNextItemPage(page: number, category?: ItemCategory): number | null {
  return (page + 1) * ITEM_PAGE_SIZE < getItemIndex(category).length ? page + 1 : null;
}

const byLanguage = (language: string) => (entry: { language: NamedAPIResource }) =>
  entry.language.name === language;

/** Le descrizioni arrivano con a capo, trattini di sillabazione e form feed dei giochi. */
function cleanText(text: string): string {
  return text
    .replace(/[­]/g, '')
    .replace(/-\n(?=\p{Ll})/gu, '')
    .replace(/[\n\f\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Ultima descrizione dei giochi in quella lingua, saltando i segnaposto come «- - -». */
function latestFlavor(raw: ItemResponse, language: string): string | null {
  const texts = raw.flavor_text_entries
    .filter(byLanguage(language))
    .map((entry) => cleanText(entry.text))
    .filter((text) => /\p{L}/u.test(text));
  return texts.at(-1) ?? null;
}

export function toItem(raw: ItemResponse): Item {
  const entry = BY_ID.get(raw.id);
  const name =
    raw.names.find(byLanguage('it'))?.name ?? raw.names.find(byLanguage('en'))?.name ?? formatName(raw.name);
  const description =
    latestFlavor(raw, 'it') ??
    latestFlavor(raw, 'en') ??
    cleanText(raw.effect_entries.find(byLanguage('en'))?.short_effect ?? '');
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
  const raw = await fetchJson<ItemResponse>(`/item/${id}`, signal, 'Oggetto non trovato.');
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
