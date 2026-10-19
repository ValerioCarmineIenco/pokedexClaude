import type { Href } from 'expo-router';

import type { IconName } from '@/components/Icon';
import { t } from '@/i18n';

/** Sezioni dell'app che si scelgono dal menu del titolo. */
export type SectionKey = 'pokedex' | 'items' | 'abilities' | 'moves' | 'natures' | 'locations' | 'types' | 'teams';

export type Section = {
  key: SectionKey;
  title: string;
  description: string;
  /** Schermata principale della sezione. */
  href: Href;
  /** Senza icona si usa la Poké Ball. */
  icon?: IconName;
};

// Per aggiungere una sezione basta una voce qui e la sua schermata in src/app.
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
