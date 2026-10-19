import { getAbilityIndexEntry } from '@/api/abilities';
import { fetchJson } from '@/api/client';
import { getIdFromUrl, isStatName, isTypeName } from '@/api/pokemon';
import { t } from '@/i18n';
import { localName } from '@/i18n/names';
import type { PokemonFormResponse, PokemonResponse } from '@/types/pokeapi';
import type { PokemonForm, PokemonFormKind, PokemonVariety } from '@/types/pokemon';
import { formatName } from '@/utils/format';
import { localized } from '@/utils/pokeapiText';

const SPRITES_BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

/** Suffissi delle forme regionali (anche `paldea-combat-breed` di Tauros). */
const REGIONAL_FORM = /^(alola|galar|hisui|paldea)\b/;

function getFormKind(form: PokemonFormResponse, isDefault: boolean): PokemonFormKind {
  if (form.is_mega) return 'mega';
  if (form.form_name === 'gmax') return 'gmax';
  if (REGIONAL_FORM.test(form.form_name)) return 'regional';
  return isDefault ? 'base' : 'special';
}

/**
 * Nome della forma nella lingua in uso. PokéAPI ha «Forma di Alola», «Forma Attacco», «Rotom Calore»,
 * ma per le Mega ripete la specie («MegaCharizard X») e per i Gigamax spesso non ha la lingua.
 */
function getFormLabel(form: PokemonFormResponse, kind: PokemonFormKind): string {
  if (kind === 'mega') {
    const suffix = form.form_name.match(/^mega-(\w+)$/)?.[1];
    return suffix ? t('pokemon:forms.megaVariant', { variant: suffix.toUpperCase() }) : t('pokemon:forms.mega');
  }
  if (kind === 'gmax') return t('pokemon:forms.kinds.gmax');
  const name = localized(form.form_names)?.name;
  if (name) return name;
  if (!form.form_name) return t('pokemon:forms.kinds.base');
  return formatName(form.form_name);
}

export function toPokemonForm(
  raw: PokemonResponse,
  form: PokemonFormResponse,
  isDefault: boolean,
): PokemonForm {
  const kind = getFormKind(form, isDefault);
  return {
    id: raw.id,
    name: raw.name,
    label: getFormLabel(form, kind),
    kind,
    isDefault,
    types: [...raw.types]
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name)
      .filter(isTypeName),
    abilities: [...raw.abilities]
      .sort((a, b) => a.slot - b.slot)
      .map((a) => {
        const abilityId = getIdFromUrl(a.ability.url);
        return {
          name: a.ability.name,
          label: localName('ability', abilityId, getAbilityIndexEntry(abilityId)?.label ?? formatName(a.ability.name)),
          isHidden: a.is_hidden,
        };
      }),
    stats: raw.stats.flatMap((s) =>
      isStatName(s.stat.name) ? [{ name: s.stat.name, value: s.base_stat }] : [],
    ),
    // Le forme hanno sempre l'artwork ufficiale; Dream World e altri stili spesso mancano.
    artworkUrl: `${SPRITES_BASE_URL}/other/official-artwork/${raw.id}.png`,
  };
}

async function fetchPokemonForm(variety: PokemonVariety, signal?: AbortSignal): Promise<PokemonForm> {
  const raw = await fetchJson<PokemonResponse>(`/pokemon/${variety.pokemonId}`, signal);
  // Ogni varietà ha una sola forma «di battaglia»: la prima porta nome e tipo di forma.
  const form = await fetchJson<PokemonFormResponse>(
    `/pokemon-form/${getIdFromUrl(raw.forms[0].url)}`,
    signal,
  );
  return toPokemonForm(raw, form, variety.isDefault);
}

/** Tutte le forme della specie, nell'ordine di PokéAPI (la base per prima). */
export function fetchPokemonForms(
  varieties: PokemonVariety[],
  signal?: AbortSignal,
): Promise<PokemonForm[]> {
  return Promise.all(varieties.map((variety) => fetchPokemonForm(variety, signal)));
}
