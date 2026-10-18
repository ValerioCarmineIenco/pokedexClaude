// Dati finti delle abilità, con la stessa forma di `useAbilities` e `useAbility`:
// servono per costruire le schermate senza rete (e nelle anteprime).

import type { Ability } from '@/types/ability';

const artwork = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export const MOCK_ABILITIES: Ability[] = [
  {
    id: 65,
    name: 'Erbaiuto',
    description: 'Quando il Pokémon ha pochi PS, la potenza delle sue mosse di tipo Erba aumenta.',
    effect:
      'When this Pokémon has 1/3 or less of its HP remaining, its Grass-type moves inflict 1.5× as much regular damage.',
    effectLanguage: 'en',
    generation: 3,
    pokemon: [
      { id: 1, name: 'bulbasaur', isHidden: false, artworkUrl: artwork(1) },
      { id: 2, name: 'ivysaur', isHidden: false, artworkUrl: artwork(2) },
      { id: 3, name: 'venusaur', isHidden: false, artworkUrl: artwork(3) },
      { id: 152, name: 'chikorita', isHidden: false, artworkUrl: artwork(152) },
    ],
  },
  {
    id: 9,
    name: 'Statico',
    description: 'Il Pokémon è carico di elettricità statica e può paralizzare chi lo tocca.',
    effect:
      "Whenever a move makes contact with this Pokémon, the move's user has a 30% chance of being paralyzed.",
    effectLanguage: 'en',
    generation: 3,
    pokemon: [
      { id: 25, name: 'pikachu', isHidden: false, artworkUrl: artwork(25) },
      { id: 26, name: 'raichu', isHidden: false, artworkUrl: artwork(26) },
      { id: 81, name: 'magnemite', isHidden: true, artworkUrl: artwork(81) },
    ],
  },
  {
    id: 91,
    name: 'Adattabilità',
    description: 'Potenzia le mosse dello stesso tipo del Pokémon.',
    effect: null,
    effectLanguage: null,
    generation: 4,
    pokemon: [{ id: 133, name: 'eevee', isHidden: false, artworkUrl: artwork(133) }],
  },
];
