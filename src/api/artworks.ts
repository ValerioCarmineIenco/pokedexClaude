import { fetchJson } from '@/api/client';
import type { PokemonResponse, SpriteTree } from '@/types/pokeapi';
import type {
  ArtworkGeneration,
  ArtworkGroup,
  ArtworkImage,
  PokemonArtworks,
} from '@/types/pokemon';
import { formatName } from '@/utils/format';

// Nomi italiani dei giochi, come chiavi di `sprites.versions` e `official-artwork.versions`.
const GAME_NAMES: Record<string, string> = {
  'red-blue': 'Rosso e Blu',
  'red-and-blue': 'Rosso e Blu',
  'red-green-japan': 'Rosso e Verde',
  'red-and-green': 'Rosso e Verde',
  yellow: 'Giallo',
  gold: 'Oro',
  silver: 'Argento',
  'gold-and-silver': 'Oro e Argento',
  crystal: 'Cristallo',
  'ruby-sapphire': 'Rubino e Zaffiro',
  emerald: 'Smeraldo',
  'firered-leafgreen': 'Rosso Fuoco e Verde Foglia',
  'diamond-pearl': 'Diamante e Perla',
  platinum: 'Platino',
  'heartgold-soulsilver': 'HeartGold e SoulSilver',
  'black-white': 'Nero e Bianco',
  'x-y': 'X e Y',
  'omega-ruby-alpha-sapphire': 'Rubino Omega e Zaffiro Alpha',
  'ultra-sun-ultra-moon': 'Ultrasole e Ultraluna',
  'lets-go-pikachu-lets-go-eevee': "Let's Go, Pikachu! e Let's Go, Eevee!",
  'sword-shield': 'Spada e Scudo',
  'brilliant-diamond-shining-pearl': 'Diamante Lucente e Perla Splendente',
  'legends-arceus': 'Leggende Pokémon: Arceus',
  'scarlet-violet': 'Scarlatto e Violetto',
  champions: 'Champions',
  icons: 'Icone',
};

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];

const VARIANT_ORDER = ['default', 'shiny', 'female', 'shiny_female'];

const MODIFIER_LABELS: Record<string, string> = {
  shiny: 'shiny',
  female: '♀',
  gray: 'in grigio',
  gbc: 'a colori (GBC)',
};

const gameName = (slug: string) => GAME_NAMES[slug] ?? formatName(slug);

/** `generation-iv` → 4 (0 se non riconosciuta). */
const generationNumber = (slug: string) => ROMAN.indexOf(slug.replace('generation-', '')) + 1;

const isTree = (value: SpriteTree[string]): value is SpriteTree =>
  typeof value === 'object' && value !== null;

/**
 * `front_shiny_female` → «Fronte shiny ♀», o «Shiny ♀» se la fonte ha solo il fronte.
 * Restituisce anche il rango per ordinare: prima il fronte, poi il retro, nell'ordine di VARIANT_ORDER.
 */
function describeVariant(key: string, frontOnly: boolean): { label: string; rank: number } {
  const [side, ...rest] = key.split('_');
  const mods = rest.filter((m) => m !== 'default');
  const modsLabel = mods.map((m) => MODIFIER_LABELS[m] ?? m).join(' ');
  const variantRank = VARIANT_ORDER.indexOf(mods.length ? mods.join('_') : 'default');
  const rank = (side === 'back' ? 100 : 0) + (variantRank === -1 ? 50 : variantRank);

  if (frontOnly && side === 'front') {
    const label = !modsLabel
      ? 'Normale'
      : modsLabel === '♀'
        ? 'Femmina'
        : modsLabel.charAt(0).toUpperCase() + modsLabel.slice(1);
    return { label, rank };
  }
  const sideLabel = side === 'back' ? 'Retro' : 'Fronte';
  return { label: modsLabel ? `${sideLabel} ${modsLabel}` : sideLabel, rank };
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
    const suffix = key === 'animated' ? 'animati' : key === 'icons' ? 'icone' : formatName(key);
    groups.push(...group(`${path}/${key}`, `${title} · ${suffix}`, imagesOf(value, `${path}/${key}`)));
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
    ...group('official-artwork', 'Artwork ufficiale', officialImages),
    ...group('home', 'Pokémon HOME', imagesOf(branch('home'), 'other/home', true)),
    ...group('dream-world', 'Dream World', imagesOf(branch('dream_world'), 'other/dream_world', true)),
    ...group('showdown', 'Showdown · animati', imagesOf(branch('showdown'), 'other/showdown')),
    ...group('base', 'Sprite base', imagesOf(sprites, 'sprites')),
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
          title: number ? `Generazione ${gen.replace('generation-', '').toUpperCase()}` : formatName(gen),
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
