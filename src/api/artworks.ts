import { fetchJson } from '@/api/client';
import { getLocale, t } from '@/i18n';
import { localName } from '@/i18n/names';
import type { PokemonResponse, SpriteTree } from '@/types/pokeapi';
import type {
  ArtworkGeneration,
  ArtworkGroup,
  ArtworkImage,
  PokemonArtworks,
} from '@/types/pokemon';
import { formatName } from '@/utils/format';

/**
 * Giochi di ciascuna chiave di `sprites.versions` e `official-artwork.versions`, come id delle
 * versioni di PokéAPI: il nome si legge nella lingua in uso con `localName('version', id)`.
 */
const GAME_VERSIONS: Record<string, number[]> = {
  'red-blue': [1, 2],
  'red-and-blue': [1, 2],
  'red-green-japan': [44, 45],
  'red-and-green': [44, 45],
  yellow: [3],
  gold: [4],
  silver: [5],
  'gold-and-silver': [4, 5],
  crystal: [6],
  'ruby-sapphire': [7, 8],
  emerald: [9],
  'firered-leafgreen': [10, 11],
  'diamond-pearl': [12, 13],
  platinum: [14],
  'heartgold-soulsilver': [15, 16],
  'black-white': [17, 18],
  'x-y': [23, 24],
  'omega-ruby-alpha-sapphire': [25, 26],
  'sun-moon': [27, 28],
  'ultra-sun-ultra-moon': [29, 30],
  'lets-go-pikachu-lets-go-eevee': [31, 32],
  'sword-shield': [33, 34],
  'brilliant-diamond-shining-pearl': [37, 38],
  'legends-arceus': [39],
  'scarlet-violet': [40, 41],
  'legends-za': [47],
  champions: [49],
};

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];

const VARIANT_ORDER = ['default', 'shiny', 'female', 'shiny_female'];

const MODIFIER_KEYS = ['shiny', 'female', 'gray', 'gbc'] as const;
type Modifier = (typeof MODIFIER_KEYS)[number];
const isModifier = (value: string): value is Modifier => (MODIFIER_KEYS as readonly string[]).includes(value);

function gameName(slug: string): string {
  if (slug === 'icons') return t('pokemon:artwork.games.icons');
  const versions = GAME_VERSIONS[slug];
  if (!versions) return formatName(slug);
  const [first, second] = versions.map((id) => localName('version', id));
  return second ? t('pokemon:artwork.games.pair', { first, second }) : first;
}

/** `generation-iv` → 4 (0 se non riconosciuta). */
const generationNumber = (slug: string) => ROMAN.indexOf(slug.replace('generation-', '')) + 1;

const isTree = (value: SpriteTree[string]): value is SpriteTree =>
  typeof value === 'object' && value !== null;

/**
 * `front_shiny_female` → «Fronte shiny ♀» (nella lingua in uso), o «Shiny ♀» se la fonte ha solo il fronte.
 * Restituisce anche il rango per ordinare: prima il fronte, poi il retro, nell'ordine di VARIANT_ORDER.
 */
function describeVariant(key: string, frontOnly: boolean): { label: string; rank: number } {
  const [side, ...rest] = key.split('_');
  const mods = rest.filter((m) => m !== 'default');
  const modsLabel = mods.map((m) => (isModifier(m) ? t(`pokemon:artwork.modifiers.${m}`) : m)).join(' ');
  const variantRank = VARIANT_ORDER.indexOf(mods.length ? mods.join('_') : 'default');
  const rank = (side === 'back' ? 100 : 0) + (variantRank === -1 ? 50 : variantRank);

  if (frontOnly && side === 'front') {
    const label = !mods.length
      ? t('pokemon:artwork.variants.normal')
      : mods.length === 1 && mods[0] === 'female'
        ? t('pokemon:artwork.variants.female')
        : modsLabel.charAt(0).toLocaleUpperCase(getLocale()) + modsLabel.slice(1);
    return { label, rank };
  }
  const sideLabel = t(side === 'back' ? 'pokemon:artwork.variants.back' : 'pokemon:artwork.variants.front');
  return {
    label: modsLabel ? t('pokemon:artwork.variants.sideWithModifiers', { side: sideLabel, modifiers: modsLabel }) : sideLabel,
    rank,
  };
}

/**
 * Le immagini dirette di un nodo (non quelle dei sotto-nodi), senza null.
 * Le varianti `transparent` dei giochi Game Boy sono lo stesso sprite senza sfondo: le saltiamo.
 */
function imagesOf(node: SpriteTree, path: string, frontOnly = false): ArtworkImage[] {
  return Object.entries(node)
    .flatMap(([key, url]) =>
      typeof url === 'string' && url && !key.includes('transparent')
        ? [{ key: `${path}/${key}`, url, ...describeVariant(key, frontOnly) }]
        : [],
    )
    .sort((a, b) => a.rank - b.rank)
    .map(({ key, url, label }) => ({ key, url, label }));
}

function group(id: string, title: string, images: ArtworkImage[]): ArtworkGroup[] {
  return images.length ? [{ id, title, images }] : [];
}

/** Un gioco può avere sprite statici, animati (`animated`) e icone (`icons`). */
function gameGroups(game: SpriteTree, path: string, title: string): ArtworkGroup[] {
  const groups = group(path, title, imagesOf(game, path));
  for (const [key, value] of Object.entries(game)) {
    if (!isTree(value)) continue;
    const subtitle =
      key === 'animated'
        ? t('pokemon:artwork.groups.animated', { title })
        : key === 'icons'
          ? t('pokemon:artwork.groups.icons', { title })
          : `${title} · ${formatName(key)}`;
    groups.push(...group(`${path}/${key}`, subtitle, imagesOf(value, `${path}/${key}`)));
  }
  return groups;
}

export function toPokemonArtworks(id: number, sprites: SpriteTree): PokemonArtworks {
  const other = isTree(sprites.other) ? sprites.other : {};
  const branch = (key: string) => {
    const value = other[key];
    return isTree(value) ? value : {};
  };

  // L'artwork ufficiale ha anche le illustrazioni dell'epoca, sotto `versions.<gen>.<gioco>`.
  const official = branch('official-artwork');
  const officialImages = imagesOf(official, 'other/official-artwork', true);
  const officialVersions = isTree(official.versions) ? official.versions : {};
  for (const [gen, games] of Object.entries(officialVersions)) {
    if (!isTree(games)) continue;
    for (const [game, node] of Object.entries(games)) {
      if (!isTree(node) || typeof node.front_default !== 'string') continue;
      officialImages.push({
        key: `other/official-artwork/versions/${gen}/${game}`,
        label: gameName(game),
        url: node.front_default,
      });
    }
  }

  const featured = [
    ...group('official-artwork', t('pokemon:artwork.groups.official'), officialImages),
    ...group('home', 'Pokémon HOME', imagesOf(branch('home'), 'other/home', true)),
    ...group('dream-world', 'Dream World', imagesOf(branch('dream_world'), 'other/dream_world', true)),
    ...group('showdown', t('pokemon:artwork.groups.animated', { title: 'Showdown' }), imagesOf(branch('showdown'), 'other/showdown')),
    ...group('base', t('pokemon:artwork.groups.base'), imagesOf(sprites, 'sprites')),
  ];

  const versions = isTree(sprites.versions) ? sprites.versions : {};
  const generations: ArtworkGeneration[] = Object.entries(versions)
    .flatMap(([gen, games]) => {
      if (!isTree(games)) return [];
      const groups = Object.entries(games).flatMap(([game, node]) =>
        isTree(node) ? gameGroups(node, `versions/${gen}/${game}`, gameName(game)) : [],
      );
      // Le icone della generazione vanno in fondo, dopo i giochi.
      const isIcons = (g: ArtworkGroup) => Number(g.id.includes('/icons'));
      groups.sort((a, b) => isIcons(a) - isIcons(b));
      const imageCount = groups.reduce((sum, g) => sum + g.images.length, 0);
      if (!imageCount) return [];
      const number = generationNumber(gen);
      return [
        {
          id: gen,
          title: number
            ? t('common:generation', { number: gen.replace('generation-', '').toUpperCase() })
            : formatName(gen),
          games: groups,
          imageCount,
          number,
        },
      ];
    })
    .sort((a, b) => a.number - b.number)
    .map(({ number: _number, ...generation }) => generation);

  const imageCount =
    featured.reduce((sum, g) => sum + g.images.length, 0) +
    generations.reduce((sum, g) => sum + g.imageCount, 0);

  return { id, featured, generations, imageCount };
}

/**
 * Galleria artwork di un Pokémon. Rilegge `/pokemon/{id}` solo quando serve, invece di
 * tenere in cache ~200 URL per ogni Pokémon dell'elenco.
 */
export async function fetchPokemonArtworks(id: number, signal?: AbortSignal): Promise<PokemonArtworks> {
  const raw = await fetchJson<PokemonResponse>(`/pokemon/${id}`, signal);
  return toPokemonArtworks(raw.id, raw.sprites);
}
