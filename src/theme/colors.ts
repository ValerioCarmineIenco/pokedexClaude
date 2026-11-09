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

/** Mescola un colore esadecimale con la base delle tinte del tema: `amount` è la quota di colore (0–1). */
export function tintColor(hex: string, amount: number): string {
  const base = parseInt(activeTheme.palette.tintBase.slice(1), 16);
  const n = parseInt(hex.slice(1), 16);
  const share = Math.min(1, amount * activeTheme.palette.tintStrength);
  const mix = (c: number, b: number) => Math.round(c * share + b * (1 - share));
  return `rgb(${mix(n >> 16, base >> 16)}, ${mix((n >> 8) & 255, (base >> 8) & 255)}, ${mix(n & 255, base & 255)})`;
}

export const radius = {
  card: 16,
  sheet: 26,
  field: 12,
  pill: 999,
} as const;
