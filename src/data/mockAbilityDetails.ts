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
      { id: 1, name: 'bulbasaur', types: ['grass', 'poison'], isHidden: false },
      { id: 2, name: 'ivysaur', types: ['grass', 'poison'], isHidden: false },
      { id: 3, name: 'venusaur', types: ['grass', 'poison'], isHidden: false },
      { id: 152, name: 'chikorita', types: ['grass'], isHidden: false },
      { id: 153, name: 'bayleef', types: ['grass'], isHidden: false },
      { id: 154, name: 'meganium', types: ['grass'], isHidden: false },
      { id: 252, name: 'treecko', types: ['grass'], isHidden: false },
      { id: 253, name: 'grovyle', types: ['grass'], isHidden: false },
      { id: 254, name: 'sceptile', types: ['grass'], isHidden: false },
    ],
  },
  {
    id: 9,
    name: 'Statico',
    description: 'Può paralizzare il nemico al contatto.',
    effect: 'Il 30% delle volte paralizza chi la colpisce con una mossa da contatto.',
    generation: 3,
    pokemon: [
      { id: 25, name: 'pikachu', types: ['electric'], isHidden: false },
      { id: 26, name: 'raichu', types: ['electric'], isHidden: false },
      { id: 172, name: 'pichu', types: ['electric'], isHidden: false },
      { id: 179, name: 'mareep', types: ['electric'], isHidden: false },
      { id: 180, name: 'flaaffy', types: ['electric'], isHidden: false },
      { id: 181, name: 'ampharos', types: ['electric'], isHidden: false },
      { id: 125, name: 'electabuzz', types: ['electric'], isHidden: false },
      { id: 309, name: 'electrike', types: ['electric'], isHidden: false },
      { id: 81, name: 'magnemite', types: ['electric', 'steel'], isHidden: false },
    ],
  },
  {
    id: 22,
    name: 'Prepotenza',
    description: 'Spaventa il nemico riducendone l’Attacco.',
    effect: 'Quando entra in campo riduce di un livello l’Attacco dei Pokémon avversari.',
    generation: 3,
    pokemon: [
      { id: 130, name: 'gyarados', types: ['water', 'flying'], isHidden: false },
      { id: 58, name: 'growlithe', types: ['fire'], isHidden: false },
      { id: 59, name: 'arcanine', types: ['fire'], isHidden: false },
      { id: 128, name: 'tauros', types: ['normal'], isHidden: false },
      { id: 209, name: 'snubbull', types: ['fairy'], isHidden: false },
      { id: 262, name: 'mightyena', types: ['dark'], isHidden: true },
      { id: 303, name: 'mawile', types: ['steel', 'fairy'], isHidden: false },
      { id: 373, name: 'salamence', types: ['dragon', 'flying'], isHidden: false },
    ],
  },
];
