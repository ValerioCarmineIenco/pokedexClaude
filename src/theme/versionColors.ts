// Colori delle pillole dei giochi (dettaglio località): testo pieno su fondo tenue.

export type VersionColor = { text: string; background: string };

const RED = { text: '#C62828', background: '#F8DADA' };
const BLUE = { text: '#2858A8', background: '#DCE5F3' };
const YELLOW = { text: '#9A7400', background: '#FBEFC4' };
const GOLD = { text: '#9A6A00', background: '#F6E6BF' };
const SILVER = { text: '#5F6670', background: '#E5E7EA' };
const GREEN = { text: '#2E8B57', background: '#DAF0E2' };
const TEAL = { text: '#167D7F', background: '#D5EEEE' };
const PURPLE = { text: '#6A3FB0', background: '#E8DFF6' };
const ORANGE = { text: '#C25A00', background: '#FCE3CC' };
const PINK = { text: '#B83280', background: '#F7DCEB' };
const DARK = { text: '#3A3840', background: '#E2E0E4' };
const LIGHT = { text: '#6B6873', background: '#F1EFEC' };

const BY_SLUG: Record<string, VersionColor> = {
  red: RED,
  'red-japan': RED,
  blue: BLUE,
  'blue-japan': BLUE,
  'green-japan': GREEN,
  yellow: YELLOW,
  gold: GOLD,
  silver: SILVER,
  crystal: TEAL,
  ruby: RED,
  sapphire: BLUE,
  emerald: GREEN,
  firered: ORANGE,
  leafgreen: GREEN,
  diamond: BLUE,
  pearl: PINK,
  platinum: SILVER,
  heartgold: GOLD,
  soulsilver: SILVER,
  black: DARK,
  white: LIGHT,
  'black-2': DARK,
  'white-2': LIGHT,
  colosseum: ORANGE,
  xd: PURPLE,
  x: BLUE,
  y: RED,
  'omega-ruby': RED,
  'alpha-sapphire': BLUE,
  sun: ORANGE,
  moon: PURPLE,
  'ultra-sun': ORANGE,
  'ultra-moon': PURPLE,
  'lets-go-pikachu': YELLOW,
  'lets-go-eevee': ORANGE,
  sword: TEAL,
  shield: RED,
  'the-isle-of-armor-sword': TEAL,
  'the-isle-of-armor-shield': RED,
  'the-crown-tundra-sword': TEAL,
  'the-crown-tundra-shield': RED,
  'brilliant-diamond': BLUE,
  'shining-pearl': PINK,
  'legends-arceus': TEAL,
  scarlet: RED,
  violet: PURPLE,
  'the-teal-mask-scarlet': RED,
  'the-teal-mask-violet': PURPLE,
  'the-indigo-disk-scarlet': RED,
  'the-indigo-disk-violet': PURPLE,
  'legends-za': GREEN,
  'mega-dimension': GREEN,
  champions: GOLD,
};

const FALLBACK: VersionColor = LIGHT;

/** Colore di un gioco dal suo slug di PokéAPI (es. `firered`); grigio per i giochi nuovi. */
export function getVersionColor(slug: string): VersionColor {
  return BY_SLUG[slug] ?? FALLBACK;
}
