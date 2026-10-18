import type { Href } from 'expo-router';

import type { IconName } from '@/components/Icon';

/** Sezioni dell'app che si scelgono dal menu del titolo. */
export type SectionKey = 'pokedex' | 'items' | 'abilities' | 'moves' | 'natures' | 'locations' | 'types';

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
export const SECTIONS: Section[] = [
  {
    key: 'pokedex',
    title: 'Pokédex',
    description: 'Tutti i Pokémon, per generazione',
    href: '/',
  },
  {
    key: 'items',
    title: 'Oggetti',
    description: 'Strumenti, rimedi, MT e megapietre',
    href: '/items',
    icon: 'bag',
  },
  {
    key: 'abilities',
    title: 'Abilità',
    description: 'Tutte le abilità dei Pokémon',
    href: '/abilities',
    icon: 'sparkles',
  },
  {
    key: 'moves',
    title: 'Mosse',
    description: 'Tipo, potenza, precisione e PP di ogni mossa',
    href: '/moves',
    icon: 'bolt',
  },
  {
    key: 'natures',
    title: 'Nature',
    description: 'Statistiche e sapori di ogni natura',
    href: '/natures',
    icon: 'leaf',
  },
  {
    key: 'locations',
    title: 'Località',
    description: 'Dove trovare i Pokémon, regione per regione',
    href: '/locations',
    icon: 'location',
  },
  {
    key: 'types',
    title: 'Tipi',
    description: 'Efficacie in attacco e in difesa di ogni tipo',
    href: '/types',
    icon: 'types',
  },
];

export function getSection(key: SectionKey): Section {
  return SECTIONS.find((section) => section.key === key) ?? SECTIONS[0];
}
