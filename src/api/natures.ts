import { fetchJson } from '@/api/client';
import natureIndex from '@/data/natureIndex.json';
import type {
  FlavorName,
  Nature,
  NatureFlavor,
  NatureIndexEntry,
  NatureStat,
  NatureStatName,
} from '@/types/nature';
import type { NamedAPIResource, NatureResponse } from '@/types/pokeapi';
import { formatName } from '@/utils/format';
import { byLanguage } from '@/utils/pokeapiText';
import { normalizeSearch } from '@/utils/search';

/**
 * Le 25 nature, in ordine di id, con il nome italiano per la ricerca.
 * Generato da `scripts/generate-nature-index.mjs`.
 */
const INDEX = natureIndex as NatureIndexEntry[];

/** Testo su cui cerca `search`: nome italiano e slug inglese («sicura bold»). */
const SEARCH_TEXT = new Map(INDEX.map((entry) => [entry.id, normalizeSearch(`${entry.label} ${entry.name}`)]));

/** Nomi completi, come nei giochi: in elenco c'è spazio per scriverli per esteso. */
const STAT_LABELS: Record<NatureStatName, string> = {
  attack: 'Attacco',
  defense: 'Difesa',
  'special-attack': 'Attacco Speciale',
  'special-defense': 'Difesa Speciale',
  speed: 'Velocità',
};

/** PokéAPI non ha i nomi italiani dei sapori: sono quelli dei giochi. */
const FLAVOR_LABELS: Record<FlavorName, string> = {
  spicy: 'Piccante',
  dry: 'Secco',
  sweet: 'Dolce',
  bitter: 'Amaro',
  sour: 'Aspro',
};

/**
 * Voci dell'indice il cui nome contiene `search` (anche parziale, senza distinzione di
 * maiuscole e accenti). Nessuna chiamata di rete.
 */
export function getNatureIndex(search = ''): NatureIndexEntry[] {
  const needle = normalizeSearch(search);
  if (!needle) return INDEX;
  return INDEX.filter((entry) => SEARCH_TEXT.get(entry.id)!.includes(needle));
}

function toStat(resource: NamedAPIResource | null): NatureStat | null {
  if (!resource || !(resource.name in STAT_LABELS)) return null;
  const name = resource.name as NatureStatName;
  return { name, label: STAT_LABELS[name] };
}

function toFlavor(resource: NamedAPIResource | null): NatureFlavor | null {
  if (!resource || !(resource.name in FLAVOR_LABELS)) return null;
  const name = resource.name as FlavorName;
  return { name, label: FLAVOR_LABELS[name] };
}

export function toNature(raw: NatureResponse): Nature {
  const name =
    raw.names.find(byLanguage('it'))?.name ?? raw.names.find(byLanguage('en'))?.name ?? formatName(raw.name);
  const increasedStat = toStat(raw.increased_stat);
  const decreasedStat = toStat(raw.decreased_stat);
  // Le neutre arrivano già con null, ma alcune versioni dei dati ripetono la stessa
  // statistica (o lo stesso sapore) in entrambi i campi: vale come nessun effetto.
  const isNeutral = !increasedStat || !decreasedStat || increasedStat.name === decreasedStat.name;
  return {
    id: raw.id,
    name,
    increasedStat: isNeutral ? null : increasedStat,
    decreasedStat: isNeutral ? null : decreasedStat,
    likedFlavor: isNeutral ? null : toFlavor(raw.likes_flavor),
    dislikedFlavor: isNeutral ? null : toFlavor(raw.hates_flavor),
    isNeutral,
  };
}

/** Una natura. */
export async function getNature(id: number, signal?: AbortSignal): Promise<Nature> {
  const raw = await fetchJson<NatureResponse>(`/nature/${id}`, signal, 'Natura non trovata.');
  return toNature(raw);
}

/** Tutte le nature, in ordine di id: sono solo 25, quindi niente pagine. */
export function getNatures(signal?: AbortSignal): Promise<Nature[]> {
  return Promise.all(INDEX.map((entry) => getNature(entry.id, signal)));
}
