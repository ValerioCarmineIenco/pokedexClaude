import type { Href } from 'expo-router';

import type { IconName } from '@/components/Icon';
import { t } from '@/i18n';

/**
 * Sezioni dell'app. Pokédex, Mosse e Squadre hanno un pulsante nella barra in basso; le altre
 * si aprono dai riquadri della schermata Altro (vedi `MORE_SECTIONS`).
 */
export type SectionKey =
  | 'pokedex'
  | 'items'
  | 'abilities'
  | 'moves'
  | 'natures'
  | 'locations'
  | 'types'
  | 'teams'
  | 'compare';

export type Section = {
  key: SectionKey;
  title: string;
  description: string;
  /** Schermata principale della sezione. */
  href: Href;
  /** Senza icona si usa la Poké Ball. */
  icon?: IconName;
};

// Per aggiungere una sezione basta una voce qui, la sua schermata in src/app e, se si apre da
// Altro, la chiave in `MORE_SECTIONS` e il colore in `SECTION_COLORS`.
const ENTRIES: Omit<Section, 'title' | 'description'>[] = [
  {
    key: 'pokedex',
    href: '/',
  },
  {
    key: 'items',
    href: '/items',
    icon: 'bag',
  },
  {
    key: 'abilities',
    href: '/abilities',
    icon: 'sparkles',
  },
  {
    key: 'moves',
    href: '/moves',
    icon: 'bolt',
  },
  {
    key: 'natures',
    href: '/natures',
    icon: 'leaf',
  },
  {
    key: 'locations',
    href: '/locations',
    icon: 'location',
  },
  {
    key: 'types',
    href: '/types',
    icon: 'types',
  },
  {
    key: 'teams',
    href: '/teams',
    icon: 'team',
  },
  {
    key: 'compare',
    href: '/compare',
    icon: 'compare',
  },
];

// Titolo e descrizione si leggono nella lingua in uso a ogni accesso.
export const SECTIONS: Section[] = ENTRIES.map((entry) => ({
  ...entry,
  get title() {
    return t(`common:sections.${entry.key}.title`);
  },
  get description() {
    return t(`common:sections.${entry.key}.description`);
  },
}));

export function getSection(key: SectionKey): Section {
  return SECTIONS.find((section) => section.key === key) ?? SECTIONS[0];
}

/** Sezioni con la barra in basso: si aprono come schede, senza pulsante indietro. */
export const TAB_SECTIONS: readonly SectionKey[] = ['pokedex', 'moves', 'teams'];

/** Riquadri della schermata Altro, nell'ordine in cui compaiono (due per riga). */
export const MORE_SECTIONS = [
  'items',
  'abilities',
  'natures',
  'locations',
  'types',
  'compare',
] as const satisfies readonly SectionKey[];
