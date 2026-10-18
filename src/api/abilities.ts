import { fetchJson } from '@/api/client';
import { LAST_POKEMON_ID } from '@/api/generations';
import { getArtworkUrl, getIdFromUrl } from '@/api/pokemon';
import abilityIndex from '@/data/abilityIndex.json';
import type { Ability, AbilityIndexEntry, AbilityPage, AbilityPokemon } from '@/types/ability';
import type { AbilityResponse } from '@/types/pokeapi';
import { perLanguage, t } from '@/i18n';
import { localName } from '@/i18n/names';
import { formatName } from '@/utils/format';
import { cleanText, latestLocalizedFlavor, localized } from '@/utils/pokeapiText';
import { normalizeSearch } from '@/utils/search';

export const ABILITY_PAGE_SIZE = 20;

/**
 * Abilità mostrate nell'app, in ordine di id: solo quelle di almeno un Pokémon del Pokédex,
 * così quando si aggiunge una generazione le sue abilità compaiono da sole.
 * Generato da `scripts/generate-ability-index.mjs`.
 */
const INDEX = (abilityIndex as AbilityIndexEntry[]).filter((entry) =>
  entry.pokemonIds.some((id) => id <= LAST_POKEMON_ID),
);
const BY_ID = new Map(INDEX.map((entry) => [entry.id, entry]));

/** Nome dell'abilità nella lingua in uso, dall'indice (senza chiamate). */
export function getAbilityLabel(entry: AbilityIndexEntry): string {
  return localName('ability', entry.id, entry.label);
}

/**
 * Testo su cui cerca `search`: nome nella lingua in uso e slug inglese («erbaiuto overgrow»).
 * Ricalcolato al cambio di lingua.
 */
const searchText = perLanguage(
  () =>
    new Map(
      INDEX.map((entry) => [
        entry.id,
        normalizeSearch(`${getAbilityLabel(entry)} ${entry.name.replace(/-/g, ' ')}`),
      ]),
    ),
);

/**
 * Voci dell'indice il cui nome contiene `search` (anche parziale, senza distinzione di
 * maiuscole e accenti). Nessuna chiamata di rete: trova anche le abilità non ancora caricate.
 */
export function getAbilityIndex(search = ''): AbilityIndexEntry[] {
  const needle = normalizeSearch(search);
  if (!needle) return INDEX;
  const texts = searchText();
  return INDEX.filter((entry) => texts.get(entry.id)!.includes(needle));
}

const BY_NAME = new Map(INDEX.map((entry) => [entry.name, entry]));

/** Voce dell'indice dallo slug di PokéAPI (es. `static`), per i link dalla scheda Pokémon. */
export function getAbilityIndexEntryByName(name: string): AbilityIndexEntry | undefined {
  return BY_NAME.get(name);
}

export function getAbilityIndexEntry(id: number): AbilityIndexEntry | undefined {
  return BY_ID.get(id);
}

/** Converte il parametro di rotta (`"65"`) in un id dell'indice, altrimenti null. */
export function parseAbilityId(value: string | string[] | number | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  return Number.isInteger(id) && BY_ID.has(id) ? id : null;
}

/** Id delle abilità di una pagina (da 0), senza chiamate. */
export function getAbilityPageIds(page: number, search?: string): number[] {
  const start = page * ABILITY_PAGE_SIZE;
  return getAbilityIndex(search)
    .slice(start, start + ABILITY_PAGE_SIZE)
    .map((entry) => entry.id);
}

/** Pagina successiva a `page`, null se è l'ultima. */
export function getNextAbilityPage(page: number, search?: string): number | null {
  return (page + 1) * ABILITY_PAGE_SIZE < getAbilityIndex(search).length ? page + 1 : null;
}

const GENERATION_NUMBERS: Record<string, number> = {
  'generation-i': 1,
  'generation-ii': 2,
  'generation-iii': 3,
  'generation-iv': 4,
  'generation-v': 5,
  'generation-vi': 6,
  'generation-vii': 7,
  'generation-viii': 8,
  'generation-ix': 9,
};

export function toAbility(raw: AbilityResponse): Ability {
  const indexEntry = BY_ID.get(raw.id);
  const name = localized(raw.names)?.name ?? (indexEntry ? getAbilityLabel(indexEntry) : formatName(raw.name));
  const flavors = raw.flavor_text_entries.map((flavor) => ({
    text: flavor.flavor_text,
    language: flavor.language,
  }));
  // Effetto per esteso nella lingua in uso se PokéAPI lo ha (spesso solo inglese e tedesco).
  const effectEntry = localized(raw.effect_entries);
  const description = latestLocalizedFlavor(flavors) ?? cleanText(effectEntry?.short_effect ?? '');
  const effect = effectEntry ? cleanText(effectEntry.effect) || null : null;

  // Solo i Pokémon del Pokédex: le forme alternative (id da 10001) e le generazioni non
  // coperte restano fuori. Uno stesso Pokémon compare una volta sola.
  const pokemon = new Map<number, AbilityPokemon>();
  for (const entry of raw.pokemon) {
    const id = getIdFromUrl(entry.pokemon.url);
    if (id > LAST_POKEMON_ID || pokemon.has(id)) continue;
    pokemon.set(id, {
      id,
      name: entry.pokemon.name,
      isHidden: entry.is_hidden,
      artworkUrl: getArtworkUrl(id),
    });
  }

  return {
    id: raw.id,
    name,
    description,
    effect,
    effectLanguage: effect ? (effectEntry?.language.name ?? null) : null,
    generation: GENERATION_NUMBERS[raw.generation.name] ?? indexEntry?.generation ?? 0,
    pokemon: [...pokemon.values()].sort((a, b) => a.id - b.id),
  };
}

/** Dettaglio di un'abilità. */
export async function getAbility(id: number, signal?: AbortSignal): Promise<Ability> {
  const raw = await fetchJson<AbilityResponse>(`/ability/${id}`, signal, t('abilities:errors.notFound'));
  return toAbility(raw);
}

/** Una pagina dell'elenco (da 0), con i dati completi di ogni abilità. */
export async function getAbilities(
  page = 0,
  { search, signal }: { search?: string; signal?: AbortSignal } = {},
): Promise<AbilityPage> {
  const abilities = await Promise.all(getAbilityPageIds(page, search).map((id) => getAbility(id, signal)));
  return {
    abilities,
    nextPage: getNextAbilityPage(page, search),
    total: getAbilityIndex(search).length,
  };
}
