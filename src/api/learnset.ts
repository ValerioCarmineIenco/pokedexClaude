import { fetchJson } from '@/api/client';
import { getMoveSummary } from '@/api/moves';
import { getIdFromUrl } from '@/api/pokemon';
import { getVersionColor } from '@/theme/versionColors';
import type { LearnedMove, LearnMethod, LearnsetVersionGroup, PokemonLearnset } from '@/types/learnset';
import type { PokemonResponse } from '@/types/pokeapi';
import { formatName } from '@/utils/format';

/**
 * Gruppi di giochi di PokéAPI in ordine di uscita, con nome italiano, generazione e un gioco
 * del gruppo per il colore (vedi `versionColors`). Un gruppo non in elenco conta come il più
 * recente: sono i giochi usciti dopo.
 */
const VERSION_GROUPS: { slug: string; label: string; generation: number; version: string }[] = [
  { slug: 'red-green-japan', label: 'Rosso e Verde (Giappone)', generation: 1, version: 'red-japan' },
  { slug: 'blue-japan', label: 'Blu (Giappone)', generation: 1, version: 'blue-japan' },
  { slug: 'red-blue', label: 'Rosso e Blu', generation: 1, version: 'red' },
  { slug: 'yellow', label: 'Giallo', generation: 1, version: 'yellow' },
  { slug: 'gold-silver', label: 'Oro e Argento', generation: 2, version: 'gold' },
  { slug: 'crystal', label: 'Cristallo', generation: 2, version: 'crystal' },
  { slug: 'ruby-sapphire', label: 'Rubino e Zaffiro', generation: 3, version: 'ruby' },
  { slug: 'colosseum', label: 'Colosseum', generation: 3, version: 'colosseum' },
  { slug: 'firered-leafgreen', label: 'Rosso Fuoco e Verde Foglia', generation: 3, version: 'firered' },
  { slug: 'emerald', label: 'Smeraldo', generation: 3, version: 'emerald' },
  { slug: 'xd', label: 'XD', generation: 3, version: 'xd' },
  { slug: 'diamond-pearl', label: 'Diamante e Perla', generation: 4, version: 'diamond' },
  { slug: 'platinum', label: 'Platino', generation: 4, version: 'platinum' },
  { slug: 'heartgold-soulsilver', label: 'HeartGold e SoulSilver', generation: 4, version: 'heartgold' },
  { slug: 'black-white', label: 'Nero e Bianco', generation: 5, version: 'black' },
  { slug: 'black-2-white-2', label: 'Nero 2 e Bianco 2', generation: 5, version: 'black-2' },
  { slug: 'x-y', label: 'X e Y', generation: 6, version: 'x' },
  { slug: 'omega-ruby-alpha-sapphire', label: 'Rubino Omega e Zaffiro Alpha', generation: 6, version: 'omega-ruby' },
  { slug: 'sun-moon', label: 'Sole e Luna', generation: 7, version: 'sun' },
  { slug: 'ultra-sun-ultra-moon', label: 'Ultrasole e Ultraluna', generation: 7, version: 'ultra-sun' },
  {
    slug: 'lets-go-pikachu-lets-go-eevee',
    label: "Let's Go, Pikachu! e Let's Go, Eevee!",
    generation: 7,
    version: 'lets-go-pikachu',
  },
  { slug: 'sword-shield', label: 'Spada e Scudo', generation: 8, version: 'sword' },
  { slug: 'the-isle-of-armor', label: "L'isola solitaria dell'armatura", generation: 8, version: 'the-isle-of-armor-sword' },
  { slug: 'the-crown-tundra', label: 'Le terre innevate della corona', generation: 8, version: 'the-crown-tundra-sword' },
  {
    slug: 'brilliant-diamond-shining-pearl',
    label: 'Diamante Lucente e Perla Splendente',
    generation: 8,
    version: 'brilliant-diamond',
  },
  { slug: 'legends-arceus', label: 'Leggende Pokémon: Arceus', generation: 8, version: 'legends-arceus' },
  { slug: 'scarlet-violet', label: 'Scarlatto e Violetto', generation: 9, version: 'scarlet' },
  { slug: 'the-teal-mask', label: 'La maschera turchese', generation: 9, version: 'the-teal-mask-scarlet' },
  { slug: 'the-indigo-disk', label: 'Il disco indaco', generation: 9, version: 'the-indigo-disk-scarlet' },
  { slug: 'legends-za', label: 'Leggende Pokémon: Z-A', generation: 9, version: 'legends-za' },
  { slug: 'mega-dimension', label: 'Megadimensione', generation: 9, version: 'mega-dimension' },
  { slug: 'champions', label: 'Pokémon Champions', generation: 9, version: 'champions' },
];

const VERSION_GROUP_ORDER = new Map(VERSION_GROUPS.map((group, index) => [group.slug, index]));

const METHODS: Record<string, LearnMethod> = {
  'level-up': 'level-up',
  machine: 'machine',
  egg: 'egg',
  // Le mosse uovo di Pichu ereditate tenendo l'Elettropalla restano tra le mosse uovo.
  'light-ball-egg': 'egg',
  tutor: 'tutor',
};

export const LEARN_METHOD_LABELS: Record<LearnMethod, string> = {
  'level-up': 'Livello',
  machine: 'MT e MN',
  egg: 'Uovo',
  tutor: 'Insegnante',
  other: 'Altri metodi',
};

/** Ordine delle sezioni nella tab. */
export const LEARN_METHODS: LearnMethod[] = ['level-up', 'machine', 'egg', 'tutor', 'other'];

const byName = (a: LearnedMove, b: LearnedMove) =>
  getMoveSummary(a.moveId)!.name.localeCompare(getMoveSummary(b.moveId)!.name, 'it');

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
        label: meta?.label ?? formatName(slug),
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
