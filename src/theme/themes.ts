/**
 * I sei temi dell'app (2.0): tre gratuiti e tre del Pacchetto stile.
 *
 * Ogni tema è una tavolozza completa con le stesse chiavi; i colori di tipi, categorie e
 * giochi restano quelli ufficiali in tutti i temi, perché servono a riconoscere le cose.
 */

export type Palette = {
  accent: string;
  /** Testo e icone sopra `accent` (pulsanti pieni, pillole selezionate). */
  onAccent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  field: string;
  line: string;
  divider: string;
  factBackground: string;
  skeleton: string;
  skeletonLine: string;
  toast: string;
  toastText: string;
  toastAction: string;
  /** Statistica aumentata / diminuita dalla natura. */
  statUp: string;
  statDown: string;
  /** Badge delle località: numero di Pokémon e di giochi. */
  pokemonBadge: string;
  pokemonBadgeText: string;
  gamesBadge: string;
  gamesBadgeText: string;
  /** Shiny tracker: interruttori attivi e contatore. */
  shiny: string;
  shinyText: string;
  /** Colore con cui si schiariscono (o scuriscono) i colori dei tipi per sfondi e carte. */
  tintBase: string;
  /** Quanto colore del tipo resta nelle tinte: nei temi scuri serve un po' di più. */
  tintStrength: number;
  /** Velo traslucido sopra le tinte (numeri, pillole sulle carte colorate). */
  veil: string;
  veilStrong: string;
  /** Velo scuro sotto fogli e finestre. */
  scrim: string;
  /** Ombre e bordi leggeri su superfici colorate. */
  hairline: string;
};

export type ThemeId = 'classic' | 'night' | 'ocean' | 'shinyGold' | 'retro' | 'spectre';

export type Theme = {
  id: ThemeId;
  premium: boolean;
  /** Tema scuro: barra di stato chiara e tinte verso il nero. */
  dark: boolean;
  palette: Palette;
};

const classic: Palette = {
  accent: '#E3350D',
  onAccent: '#FFFFFF',
  background: '#F7F6F4',
  surface: '#FFFFFF',
  text: '#1D1C22',
  textMuted: '#6B6873',
  textSubtle: '#8A8792',
  field: '#EBE9E6',
  line: '#E1DED9',
  divider: '#EEEAE6',
  factBackground: '#F6F4F1',
  skeleton: '#EFECE8',
  skeletonLine: '#E2DED9',
  toast: '#1D1C22',
  toastText: '#FFFFFF',
  toastAction: '#FFB39F',
  statUp: '#2F9E62',
  statDown: '#D6402B',
  pokemonBadge: '#D7EFEE',
  pokemonBadgeText: '#1E8C88',
  gamesBadge: '#FDEBD3',
  gamesBadgeText: '#C26A0A',
  shiny: '#FCEFC4',
  shinyText: '#9A6B00',
  tintBase: '#FFFFFF',
  tintStrength: 1,
  veil: 'rgba(255, 255, 255, 0.4)',
  veilStrong: 'rgba(255, 255, 255, 0.7)',
  scrim: 'rgba(29, 28, 34, 0.28)',
  hairline: 'rgba(29, 28, 34, 0.08)',
};

const night: Palette = {
  accent: '#FF5A3C',
  onAccent: '#FFFFFF',
  background: '#121116',
  surface: '#1D1C22',
  text: '#F2F0F5',
  textMuted: '#AAA6B3',
  textSubtle: '#817D8B',
  field: '#28272E',
  line: '#302F37',
  divider: '#28272E',
  factBackground: '#232228',
  skeleton: '#26252C',
  skeletonLine: '#313038',
  toast: '#F2F0F5',
  toastText: '#1D1C22',
  toastAction: '#D6402B',
  statUp: '#4CC487',
  statDown: '#FF6B57',
  pokemonBadge: '#163A39',
  pokemonBadgeText: '#6FD6D1',
  gamesBadge: '#3D2A12',
  gamesBadgeText: '#F2A848',
  shiny: '#3A3112',
  shinyText: '#F5C94A',
  tintBase: '#1D1C22',
  tintStrength: 1.1,
  veil: 'rgba(255, 255, 255, 0.08)',
  veilStrong: 'rgba(255, 255, 255, 0.14)',
  scrim: 'rgba(0, 0, 0, 0.55)',
  hairline: 'rgba(255, 255, 255, 0.1)',
};

const ocean: Palette = {
  ...classic,
  accent: '#1F7AE0',
  background: '#EFF5FA',
  surface: '#FFFFFF',
  text: '#13222E',
  textMuted: '#5A6B79',
  textSubtle: '#7D8C99',
  field: '#E1EBF3',
  line: '#D3E0EA',
  divider: '#E3ECF3',
  factBackground: '#EDF3F8',
  skeleton: '#E4EDF4',
  skeletonLine: '#D3E0EA',
  toast: '#13222E',
  toastAction: '#9CCBFF',
  tintBase: '#FFFFFF',
  scrim: 'rgba(19, 34, 46, 0.3)',
  hairline: 'rgba(19, 34, 46, 0.08)',
};

const shinyGold: Palette = {
  ...night,
  accent: '#E8B830',
  onAccent: '#1D1608',
  background: '#15120C',
  surface: '#211C13',
  text: '#F8F0DA',
  textMuted: '#C4B694',
  textSubtle: '#958866',
  field: '#2D261A',
  line: '#3B3221',
  divider: '#2D261A',
  factBackground: '#282116',
  skeleton: '#2A2318',
  skeletonLine: '#3B3221',
  toast: '#F8F0DA',
  toastText: '#211C13',
  toastAction: '#9A6B00',
  shiny: '#4A3A10',
  shinyText: '#FFD45C',
  tintBase: '#211C13',
};

const retro: Palette = {
  ...classic,
  accent: '#3E6B1F',
  onAccent: '#E6EDCB',
  background: '#CDD8A6',
  surface: '#E2EAC4',
  text: '#1C2F10',
  textMuted: '#486031',
  textSubtle: '#66794A',
  field: '#C1CE96',
  line: '#AFBE82',
  divider: '#BCC991',
  factBackground: '#D6DFB4',
  skeleton: '#C4D09A',
  skeletonLine: '#B3C188',
  toast: '#1C2F10',
  toastText: '#E2EAC4',
  toastAction: '#C1CE96',
  statUp: '#2F6B1A',
  statDown: '#8A3A12',
  pokemonBadge: '#C1CE96',
  pokemonBadgeText: '#2F5014',
  gamesBadge: '#C1CE96',
  gamesBadgeText: '#2F5014',
  shiny: '#C1CE96',
  shinyText: '#2F5014',
  tintBase: '#E2EAC4',
  tintStrength: 0.85,
  veil: 'rgba(226, 234, 196, 0.5)',
  veilStrong: 'rgba(226, 234, 196, 0.8)',
  scrim: 'rgba(28, 47, 16, 0.35)',
  hairline: 'rgba(28, 47, 16, 0.12)',
};

const spectre: Palette = {
  ...night,
  accent: '#E64FD1',
  onAccent: '#FFFFFF',
  background: '#120D1D',
  surface: '#1D162D',
  text: '#F2EBFF',
  textMuted: '#B1A4CD',
  textSubtle: '#867BA1',
  field: '#28203C',
  line: '#33294B',
  divider: '#28203C',
  factBackground: '#221A35',
  skeleton: '#251D38',
  skeletonLine: '#33294B',
  toast: '#F2EBFF',
  toastText: '#1D162D',
  toastAction: '#A62B94',
  statUp: '#5AD39A',
  statDown: '#FF6E8A',
  tintBase: '#1D162D',
};

export const THEMES: Theme[] = [
  { id: 'classic', premium: false, dark: false, palette: classic },
  { id: 'night', premium: false, dark: true, palette: night },
  { id: 'ocean', premium: false, dark: false, palette: ocean },
  { id: 'shinyGold', premium: true, dark: true, palette: shinyGold },
  { id: 'retro', premium: true, dark: false, palette: retro },
  { id: 'spectre', premium: true, dark: true, palette: spectre },
];

export const DEFAULT_THEME_ID: ThemeId = 'classic';

export function getTheme(id: ThemeId): Theme {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && THEMES.some((theme) => theme.id === value);
}
