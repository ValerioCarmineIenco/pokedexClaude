import { getTheme, DEFAULT_THEME_ID, type Palette, type Theme } from './themes';

// Colori dell'interfaccia: la tavolozza del tema attivo (vedi `themes.ts`).
//
// `colors.x` si legge sempre al momento dell'uso, quindi segue il tema; gli stili a livello di
// modulo vanno creati con `themedStyles` (in `styles.ts`), che li ricalcola a ogni cambio di tema.

let activeTheme: Theme = getTheme(DEFAULT_THEME_ID);

/** Cambia la tavolozza in uso. Lo chiama solo `ThemeGate`, che poi rimonta le schermate. */
export function setActiveTheme(theme: Theme) {
  activeTheme = theme;
}

export function getActiveTheme(): Theme {
  return activeTheme;
}

export const colors = {} as Readonly<Palette>;
for (const key of Object.keys(activeTheme.palette) as (keyof Palette)[]) {
  Object.defineProperty(colors, key, { get: () => activeTheme.palette[key], enumerable: true });
}

/** Mescola due colori esadecimali: `share` è la quota del primo (0–1). Restituisce `rgb(...)`. */
export function mixColors(hex: string, baseHex: string, share: number): string {
  const n = parseInt(hex.slice(1), 16);
  const base = parseInt(baseHex.slice(1), 16);
  const s = Math.max(0, Math.min(1, share));
  const mix = (c: number, b: number) => Math.round(c * s + b * (1 - s));
  return `rgb(${mix(n >> 16, base >> 16)}, ${mix((n >> 8) & 255, (base >> 8) & 255)}, ${mix(n & 255, base & 255)})`;
}

/** Mescola un colore esadecimale con la base delle tinte del tema: `amount` è la quota di colore (0–1). */
export function tintColor(hex: string, amount: number): string {
  const { tintBase, tintStrength } = activeTheme.palette;
  return mixColors(hex, tintBase, amount * tintStrength);
}

/** Luminanza relativa (0 nero, 1 bianco) di un colore esadecimale, per scegliere testo chiaro o scuro. */
export function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(n >> 16) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

export const radius = {
  /** Carte, riquadri e pannelli del design «Collezione». */
  tile: 24,
  card: 16,
  /** Chip dei filtri ed etichette dei tipi. */
  chip: 12,
  sheet: 26,
  field: 12,
  pill: 999,
} as const;
