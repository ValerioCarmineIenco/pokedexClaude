// Dati finti delle mosse, con la stessa forma di `useMove` (dati reali di PokéAPI, Pokémon
// accorciati): servono per costruire il dettaglio senza rete (e nelle anteprime).
// L'elenco non ne ha bisogno: `useMoves` legge l'indice locale.

import type { Move, TypeMatchups } from '@/types/move';

/** Fulmine (speciale, con effetto secondario) e Danzaspada (di stato, cambia le statistiche). */
export const MOCK_MOVES: Move[] = [
  {
    id: 85,
    name: 'Fulmine',
    type: 'electric',
    damageClass: 'special',
    damageClassLabel: 'Speciale',
    power: 90,
    accuracy: 100,
    pp: 15,
    generation: 1,
    description: 'Il bersaglio viene colpito da una potente scarica elettrica che può anche paralizzarlo.',
    effect: 'Inflicts regular damage. Has a chance to paralyze the target.',
    shortEffect: 'Has a chance to paralyze the target.',
    effectChance: 10,
    priority: 0,
    target: 'selected-pokemon',
    targetLabel: 'Un Pokémon a scelta',
    ailment: 'Paralisi',
    ailmentChance: 10,
    flinchChance: 0,
    critRate: 0,
    hits: null,
    turns: null,
    drain: 0,
    healing: 0,
    statChanges: [],
    statChance: 0,
    pokemon: [
      { id: 19, name: 'rattata', artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/19.png' },
      { id: 20, name: 'raticate', artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/20.png' },
      { id: 25, name: 'pikachu', artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' },
    ],
  },
  {
    id: 14,
    name: 'Danzaspada',
    type: 'normal',
    damageClass: 'status',
    damageClassLabel: 'Stato',
    power: null,
    accuracy: null,
    pp: 20,
    generation: 1,
    description: 'Danza frenetica che incrementa lo spirito combattivo. Chi la usa aumenta di molto il suo Attacco.',
    effect: 'Raises the user’s Attack by two stages.',
    shortEffect: 'Raises the user’s Attack by two stages.',
    effectChance: null,
    priority: 0,
    target: 'user',
    targetLabel: 'Chi la usa',
    ailment: null,
    ailmentChance: 0,
    flinchChance: 0,
    critRate: 0,
    hits: null,
    turns: null,
    drain: 0,
    healing: 0,
    statChanges: [
      { stat: 'attack', label: 'Attacco', change: 2 },
    ],
    statChance: 0,
    pokemon: [
      { id: 1, name: 'bulbasaur', artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png' },
      { id: 2, name: 'ivysaur', artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png' },
      { id: 3, name: 'venusaur', artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png' },
    ],
  },
];

/** Efficacia di Elettro e Normale (quest'ultimo con un'immunità in attacco e in difesa). */
export const MOCK_TYPE_MATCHUPS: TypeMatchups[] = [
  {
    type: 'electric',
    attack: {
      superEffective: [
        { type: 'water', label: 'Acqua' },
        { type: 'flying', label: 'Volante' },
      ],
      notVeryEffective: [
        { type: 'electric', label: 'Elettro' },
        { type: 'grass', label: 'Erba' },
        { type: 'dragon', label: 'Drago' },
      ],
      noEffect: [
        { type: 'ground', label: 'Terra' },
      ],
      normal: [
        { type: 'normal', label: 'Normale' },
        { type: 'fire', label: 'Fuoco' },
        { type: 'ice', label: 'Ghiaccio' },
        { type: 'fighting', label: 'Lotta' },
        { type: 'poison', label: 'Veleno' },
        { type: 'psychic', label: 'Psico' },
        { type: 'bug', label: 'Coleottero' },
        { type: 'rock', label: 'Roccia' },
        { type: 'ghost', label: 'Spettro' },
        { type: 'dark', label: 'Buio' },
        { type: 'steel', label: 'Acciaio' },
        { type: 'fairy', label: 'Folletto' },
      ],
    },
    defense: {
      weakTo: [
        { type: 'ground', label: 'Terra' },
      ],
      resists: [
        { type: 'electric', label: 'Elettro' },
        { type: 'flying', label: 'Volante' },
        { type: 'steel', label: 'Acciaio' },
      ],
      immuneTo: [],
    },
  },
  {
    type: 'normal',
    attack: {
      superEffective: [],
      notVeryEffective: [
        { type: 'rock', label: 'Roccia' },
        { type: 'steel', label: 'Acciaio' },
      ],
      noEffect: [
        { type: 'ghost', label: 'Spettro' },
      ],
      normal: [
        { type: 'normal', label: 'Normale' },
        { type: 'fire', label: 'Fuoco' },
        { type: 'water', label: 'Acqua' },
        { type: 'electric', label: 'Elettro' },
        { type: 'grass', label: 'Erba' },
        { type: 'ice', label: 'Ghiaccio' },
        { type: 'fighting', label: 'Lotta' },
        { type: 'poison', label: 'Veleno' },
        { type: 'ground', label: 'Terra' },
        { type: 'flying', label: 'Volante' },
        { type: 'psychic', label: 'Psico' },
        { type: 'bug', label: 'Coleottero' },
        { type: 'dragon', label: 'Drago' },
        { type: 'dark', label: 'Buio' },
        { type: 'fairy', label: 'Folletto' },
      ],
    },
    defense: {
      weakTo: [
        { type: 'fighting', label: 'Lotta' },
      ],
      resists: [],
      immuneTo: [
        { type: 'ghost', label: 'Spettro' },
      ],
    },
  },
];
