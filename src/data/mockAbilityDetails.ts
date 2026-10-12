import { getArtworkUrl as art } from '@/api/pokemon';
import type { AbilityDetail } from '@/components/abilities/AbilityDetailView';

// Dati finti per il dettaglio abilità, finché i dati PokéAPI delle abilità non sono su main.
// Gli id sono quelli di PokéAPI (`/ability/{id}`).
export const MOCK_ABILITY_DETAILS: AbilityDetail[] = [
  {
    id: 65,
    name: 'Erbaiuto',
    description: 'Potenzia le mosse di tipo Erba in caso di difficoltà.',
    effect: 'Aumenta del 50% la potenza delle mosse di tipo Erba quando i PS scendono sotto un terzo.',
    generation: 3,
    pokemon: [
      { id: 1, name: 'bulbasaur', isHidden: false, artworkUrl: art(1), types: ['grass', 'poison'] },
      { id: 2, name: 'ivysaur', isHidden: false, artworkUrl: art(2), types: ['grass', 'poison'] },
      { id: 3, name: 'venusaur', isHidden: false, artworkUrl: art(3), types: ['grass', 'poison'] },
      { id: 152, name: 'chikorita', isHidden: false, artworkUrl: art(152), types: ['grass'] },
      { id: 153, name: 'bayleef', isHidden: false, artworkUrl: art(153), types: ['grass'] },
      { id: 154, name: 'meganium', isHidden: false, artworkUrl: art(154), types: ['grass'] },
      { id: 252, name: 'treecko', isHidden: false, artworkUrl: art(252), types: ['grass'] },
      { id: 253, name: 'grovyle', isHidden: false, artworkUrl: art(253), types: ['grass'] },
      { id: 254, name: 'sceptile', isHidden: false, artworkUrl: art(254), types: ['grass'] },
    ],
  },
  {
    id: 9,
    name: 'Statico',
    description: 'Può paralizzare il nemico al contatto.',
    effect: 'Il 30% delle volte paralizza chi la colpisce con una mossa da contatto.',
    generation: 3,
    pokemon: [
      { id: 25, name: 'pikachu', isHidden: false, artworkUrl: art(25), types: ['electric'] },
      { id: 26, name: 'raichu', isHidden: false, artworkUrl: art(26), types: ['electric'] },
      { id: 172, name: 'pichu', isHidden: false, artworkUrl: art(172), types: ['electric'] },
      { id: 179, name: 'mareep', isHidden: false, artworkUrl: art(179), types: ['electric'] },
      { id: 180, name: 'flaaffy', isHidden: false, artworkUrl: art(180), types: ['electric'] },
      { id: 181, name: 'ampharos', isHidden: false, artworkUrl: art(181), types: ['electric'] },
      { id: 125, name: 'electabuzz', isHidden: false, artworkUrl: art(125), types: ['electric'] },
      { id: 309, name: 'electrike', isHidden: false, artworkUrl: art(309), types: ['electric'] },
      { id: 81, name: 'magnemite', isHidden: false, artworkUrl: art(81), types: ['electric', 'steel'] },
    ],
  },
  {
    id: 22,
    name: 'Prepotenza',
    description: 'Spaventa il nemico riducendone l’Attacco.',
    effect: 'Quando entra in campo riduce di un livello l’Attacco dei Pokémon avversari.',
    generation: 3,
    pokemon: [
      { id: 130, name: 'gyarados', isHidden: false, artworkUrl: art(130), types: ['water', 'flying'] },
      { id: 58, name: 'growlithe', isHidden: false, artworkUrl: art(58), types: ['fire'] },
      { id: 59, name: 'arcanine', isHidden: false, artworkUrl: art(59), types: ['fire'] },
      { id: 128, name: 'tauros', isHidden: false, artworkUrl: art(128), types: ['normal'] },
      { id: 209, name: 'snubbull', isHidden: false, artworkUrl: art(209), types: ['fairy'] },
      { id: 262, name: 'mightyena', isHidden: true, artworkUrl: art(262), types: ['dark'] },
      { id: 303, name: 'mawile', isHidden: false, artworkUrl: art(303), types: ['steel', 'fairy'] },
      { id: 373, name: 'salamence', isHidden: false, artworkUrl: art(373), types: ['dragon', 'flying'] },
    ],
  },
];
