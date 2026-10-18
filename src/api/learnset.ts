import { fetchJson } from '@/api/client';
import { getMoveSummary } from '@/api/moves';
import { getIdFromUrl } from '@/api/pokemon';
import { getLocale, labelMap, t } from '@/i18n';
import type en from '@/i18n/locales/en/moves.json';
import { getVersionColor } from '@/theme/versionColors';
import type { LearnedMove, LearnMethod, LearnsetVersionGroup, PokemonLearnset } from '@/types/learnset';
import type { PokemonResponse } from '@/types/pokeapi';
import { formatName } from '@/utils/format';

type VersionGroupSlug = keyof (typeof en)['learnset']['versionGroups'];

/**
 * Gruppi di giochi di PokéAPI in ordine di uscita, con generazione e un gioco del gruppo per
 * il colore (vedi `versionColors`). Il nome è in `moves:learnset.versionGroups` (PokéAPI non
 * ha i nomi dei gruppi). Un gruppo non in elenco conta come il più recente: sono i giochi
 * usciti dopo.
 */
const VERSION_GROUPS: { slug: VersionGroupSlug; generation: number; version: string }[] = [
  { slug: 'red-green-japan', generation: 1, version: 'red-japan' },
  { slug: 'blue-japan', generation: 1, version: 'blue-japan' },
  { slug: 'red-blue', generation: 1, version: 'red' },
  { slug: 'yellow', generation: 1, version: 'yellow' },
  { slug: 'gold-silver', generation: 2, version: 'gold' },
  { slug: 'crystal', generation: 2, version: 'crystal' },
  { slug: 'ruby-sapphire', generation: 3, version: 'ruby' },
  { slug: 'colosseum', generation: 3, version: 'colosseum' },
  { slug: 'firered-leafgreen', generation: 3, version: 'firered' },
  { slug: 'emerald', generation: 3, version: 'emerald' },
  { slug: 'xd', generation: 3, version: 'xd' },
  { slug: 'diamond-pearl', generation: 4, version: 'diamond' },
  { slug: 'platinum', generation: 4, version: 'platinum' },
  { slug: 'heartgold-soulsilver', generation: 4, version: 'heartgold' },
  { slug: 'black-white', generation: 5, version: 'black' },
  { slug: 'black-2-white-2', generation: 5, version: 'black-2' },
  { slug: 'x-y', generation: 6, version: 'x' },
  { slug: 'omega-ruby-alpha-sapphire', generation: 6, version: 'omega-ruby' },
  { slug: 'sun-moon', generation: 7, version: 'sun' },
  { slug: 'ultra-sun-ultra-moon', generation: 7, version: 'ultra-sun' },
  { slug: 'lets-go-pikachu-lets-go-eevee', generation: 7, version: 'lets-go-pikachu' },
  { slug: 'sword-shield', generation: 8, version: 'sword' },
  { slug: 'the-isle-of-armor', generation: 8, version: 'the-isle-of-armor-sword' },
  { slug: 'the-crown-tundra', generation: 8, version: 'the-crown-tundra-sword' },
  { slug: 'brilliant-diamond-shining-pearl', generation: 8, version: 'brilliant-diamond' },
  { slug: 'legends-arceus', generation: 8, version: 'legends-arceus' },
  { slug: 'scarlet-violet', generation: 9, version: 'scarlet' },
  { slug: 'the-teal-mask', generation: 9, version: 'the-teal-mask-scarlet' },
  { slug: 'the-indigo-disk', generation: 9, version: 'the-indigo-disk-scarlet' },
  { slug: 'legends-za', generation: 9, version: 'legends-za' },
  { slug: 'mega-dimension', generation: 9, version: 'mega-dimension' },
  { slug: 'champions', generation: 9, version: 'champions' },
];

const VERSION_GROUP_ORDER = new Map<string, number>(VERSION_GROUPS.map((group, index) => [group.slug, index]));

const METHODS: Record<string, LearnMethod> = {
  'level-up': 'level-up',
  machine: 'machine',
  egg: 'egg',
  // Le mosse uovo di Pichu ereditate tenendo l'Elettropalla restano tra le mosse uovo.
  'light-ball-egg': 'egg',
  tutor: 'tutor',
};

/** Ordine delle sezioni nella tab. */
export const LEARN_METHODS: LearnMethod[] = ['level-up', 'machine', 'egg', 'tutor', 'other'];

/** Nome del metodo nella lingua in uso (Livello, MT e MN…). */
export const LEARN_METHOD_LABELS: Record<LearnMethod, string> = labelMap(LEARN_METHODS, (method) =>
  t(`moves:learnset.methods.${method}`),
);

const byName = (a: LearnedMove, b: LearnedMove) =>
  getMoveSummary(a.moveId)!.name.localeCompare(getMoveSummary(b.moveId)!.name, getLocale());

export function toLearnset(raw: PokemonResponse): PokemonLearnset {
  // Per gruppo: mossa e metodo una volta sola, con l'ordine di PokéAPI tra pari livello.
  const groups = new Map<string, Map<string, LearnedMove & { order: number }>>();
  for (const entry of raw.moves) {
    const moveId = getIdFromUrl(entry.move.url);
    // Mosse fuori dall'indice (es. Ombra): non hanno una scheda da aprire.
    if (!getMoveSummary(moveId)) continue;
    for (const detail of entry.version_group_details) {
      const method = METHODS[detail.move_learn_method.name] ?? 'other';
      const level = method === 'level-up' ? detail.level_learned_at : 0;
      const slug = detail.version_group.name;
      const moves = groups.get(slug) ?? new Map();
      groups.set(slug, moves);
      // Una mossa può comparire a più livelli (es. Mega Draco): ogni livello è una riga.
      const key = `${moveId}:${method}:${level}`;
      if (!moves.has(key)) moves.set(key, { moveId, method, level, order: detail.order ?? 0 });
    }
  }

  const versionGroups: LearnsetVersionGroup[] = [...groups.entries()]
    .map(([slug, moves]) => {
      const meta = VERSION_GROUPS.find((group) => group.slug === slug);
      // Per metodo; poi per livello (e ordine di PokéAPI) o per nome.
      const sorted = [...moves.values()].sort(
        (a, b) =>
          LEARN_METHODS.indexOf(a.method) - LEARN_METHODS.indexOf(b.method) ||
          a.level - b.level ||
          a.order - b.order ||
          byName(a, b),
      );
      return {
        slug,
        label: meta ? t(`moves:learnset.versionGroups.${meta.slug}`) : formatName(slug),
        generation: meta?.generation ?? 0,
        color: getVersionColor(meta?.version ?? slug).text,
        moves: sorted.map(({ moveId, method, level }) => ({ moveId, method, level })),
      };
    })
    .sort(
      (a, b) =>
        (VERSION_GROUP_ORDER.get(b.slug) ?? VERSION_GROUPS.length) -
        (VERSION_GROUP_ORDER.get(a.slug) ?? VERSION_GROUPS.length),
    );

  const withLevelUp = versionGroups.find((group) => group.moves.some((move) => move.method === 'level-up'));
  return {
    versionGroups,
    defaultVersionGroup: (withLevelUp ?? versionGroups[0])?.slug ?? null,
  };
}

/** Mosse apprese da un Pokémon, per gruppo di giochi. */
export async function fetchPokemonLearnset(id: number, signal?: AbortSignal): Promise<PokemonLearnset> {
  const raw = await fetchJson<PokemonResponse>(`/pokemon/${id}`, signal);
  return toLearnset(raw);
}
