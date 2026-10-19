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
import { labelMap, perLanguage, t } from '@/i18n';
import { localName } from '@/i18n/names';
import { formatName } from '@/utils/format';
import { localized } from '@/utils/pokeapiText';
import { normalizeSearch } from '@/utils/search';

/**
 * Le 25 nature, in ordine di id, con il nome italiano (fallback se mancano i nomi generati).
 * Generato da `scripts/generate-nature-index.mjs`.
 */
const INDEX = natureIndex as NatureIndexEntry[];

/** Nome della natura nella lingua in uso, dall'indice (senza chiamate). */
export function getNatureLabel(entry: NatureIndexEntry): string {
  return localName('nature', entry.id, entry.label);
}

/**
 * Testo su cui cerca `search`: nome nella lingua in uso e slug inglese («sicura bold»).
 * Ricalcolato al cambio di lingua.
 */
const searchText = perLanguage(
  () => new Map(INDEX.map((entry) => [entry.id, normalizeSearch(`${getNatureLabel(entry)} ${entry.name}`)])),
);

/** Nomi completi delle statistiche, come nei giochi: in elenco c'è spazio per scriverli per esteso. */
const STAT_LABELS: Record<NatureStatName, string> = labelMap(
  ['attack', 'defense', 'special-attack', 'special-defense', 'speed'],
  (stat) => localName('stat', stat),
);

/** PokéAPI non ha i nomi dei sapori in tutte le lingue: sono quelli dei giochi, tradotti a mano. */
const FLAVOR_LABELS: Record<FlavorName, string> = labelMap(
  ['spicy', 'dry', 'sweet', 'bitter', 'sour'],
  (flavor) => t(`natures:flavors.${flavor}`),
);

/**
 * Voci dell'indice il cui nome contiene `search` (anche parziale, senza distinzione di
 * maiuscole e accenti). Nessuna chiamata di rete.
 */
export function getNatureIndex(search = ''): NatureIndexEntry[] {
  const needle = normalizeSearch(search);
  if (!needle) return INDEX;
  const texts = searchText();
  return INDEX.filter((entry) => texts.get(entry.id)!.includes(needle));
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
  const entry = INDEX.find((indexEntry) => indexEntry.id === raw.id);
  const name = localized(raw.names)?.name ?? (entry ? getNatureLabel(entry) : formatName(raw.name));
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
  const raw = await fetchJson<NatureResponse>(`/nature/${id}`, signal, t('natures:errors.notFound'));
  return toNature(raw);
}

/** Tutte le nature, in ordine di id: sono solo 25, quindi niente pagine. */
export function getNatures(signal?: AbortSignal): Promise<Nature[]> {
  return Promise.all(INDEX.map((entry) => getNature(entry.id, signal)));
}
