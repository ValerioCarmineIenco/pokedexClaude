// Dati d'esempio per sviluppare l'interfaccia senza rete, con gli stessi tipi del livello dati.
// Verranno sostituiti dai dati di PokéAPI quando le due parti saranno collegate.
import { getArtworkUrl } from '@/api/pokemon';
import type { Pokemon, PokemonDetail, StatName, TypeName } from '@/types/pokemon';

// "nome:tipo1/tipo2", in ordine di numero di Pokédex (1–151).
const GEN_1 = [
  'bulbasaur:grass/poison', 'ivysaur:grass/poison', 'venusaur:grass/poison', 'charmander:fire',
  'charmeleon:fire', 'charizard:fire/flying', 'squirtle:water', 'wartortle:water', 'blastoise:water',
  'caterpie:bug', 'metapod:bug', 'butterfree:bug/flying', 'weedle:bug/poison', 'kakuna:bug/poison',
  'beedrill:bug/poison', 'pidgey:normal/flying', 'pidgeotto:normal/flying', 'pidgeot:normal/flying',
  'rattata:normal', 'raticate:normal', 'spearow:normal/flying', 'fearow:normal/flying', 'ekans:poison',
  'arbok:poison', 'pikachu:electric', 'raichu:electric', 'sandshrew:ground', 'sandslash:ground',
  'nidoran-f:poison', 'nidorina:poison', 'nidoqueen:poison/ground', 'nidoran-m:poison',
  'nidorino:poison', 'nidoking:poison/ground', 'clefairy:fairy', 'clefable:fairy', 'vulpix:fire',
  'ninetales:fire', 'jigglypuff:normal/fairy', 'wigglytuff:normal/fairy', 'zubat:poison/flying',
  'golbat:poison/flying', 'oddish:grass/poison', 'gloom:grass/poison', 'vileplume:grass/poison',
  'paras:bug/grass', 'parasect:bug/grass', 'venonat:bug/poison', 'venomoth:bug/poison',
  'diglett:ground', 'dugtrio:ground', 'meowth:normal', 'persian:normal', 'psyduck:water',
  'golduck:water', 'mankey:fighting', 'primeape:fighting', 'growlithe:fire', 'arcanine:fire',
  'poliwag:water', 'poliwhirl:water', 'poliwrath:water/fighting', 'abra:psychic', 'kadabra:psychic',
  'alakazam:psychic', 'machop:fighting', 'machoke:fighting', 'machamp:fighting',
  'bellsprout:grass/poison', 'weepinbell:grass/poison', 'victreebel:grass/poison',
  'tentacool:water/poison', 'tentacruel:water/poison', 'geodude:rock/ground', 'graveler:rock/ground',
  'golem:rock/ground', 'ponyta:fire', 'rapidash:fire', 'slowpoke:water/psychic',
  'slowbro:water/psychic', 'magnemite:electric/steel', 'magneton:electric/steel',
  'farfetchd:normal/flying', 'doduo:normal/flying', 'dodrio:normal/flying', 'seel:water',
  'dewgong:water/ice', 'grimer:poison', 'muk:poison', 'shellder:water', 'cloyster:water/ice',
  'gastly:ghost/poison', 'haunter:ghost/poison', 'gengar:ghost/poison', 'onix:rock/ground',
  'drowzee:psychic', 'hypno:psychic', 'krabby:water', 'kingler:water', 'voltorb:electric',
  'electrode:electric', 'exeggcute:grass/psychic', 'exeggutor:grass/psychic', 'cubone:ground',
  'marowak:ground', 'hitmonlee:fighting', 'hitmonchan:fighting', 'lickitung:normal',
  'koffing:poison', 'weezing:poison', 'rhyhorn:ground/rock', 'rhydon:ground/rock', 'chansey:normal',
  'tangela:grass', 'kangaskhan:normal', 'horsea:water', 'seadra:water', 'goldeen:water',
  'seaking:water', 'staryu:water', 'starmie:water/psychic', 'mr-mime:psychic/fairy',
  'scyther:bug/flying', 'jynx:ice/psychic', 'electabuzz:electric', 'magmar:fire', 'pinsir:bug',
  'tauros:normal', 'magikarp:water', 'gyarados:water/flying', 'lapras:water/ice', 'ditto:normal',
  'eevee:normal', 'vaporeon:water', 'jolteon:electric', 'flareon:fire', 'porygon:normal',
  'omanyte:rock/water', 'omastar:rock/water', 'kabuto:rock/water', 'kabutops:rock/water',
  'aerodactyl:rock/flying', 'snorlax:normal', 'articuno:ice/flying', 'zapdos:electric/flying',
  'moltres:fire/flying', 'dratini:dragon', 'dragonair:dragon', 'dragonite:dragon/flying',
  'mewtwo:psychic', 'mew:psychic',
];

const STAT_NAMES: StatName[] = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
];

type Values = [number, number, number, number, number, number];

type Extra = {
  height: number;
  weight: number;
  abilities: Pokemon['abilities'];
  stats: Values;
  description: string | null;
};

// Schede complete per alcuni Pokémon; gli altri ricevono valori generici.
const EXTRAS: Record<number, Extra> = {
  1: {
    height: 7,
    weight: 69,
    abilities: [
      { name: 'overgrow', isHidden: false },
      { name: 'chlorophyll', isHidden: true },
    ],
    stats: [45, 49, 49, 65, 65, 45],
    description:
      'Fin dalla nascita questo Pokémon ha sul dorso un seme che cresce lentamente assorbendo i raggi del sole.',
  },
  4: {
    height: 6,
    weight: 85,
    abilities: [
      { name: 'blaze', isHidden: false },
      { name: 'solar-power', isHidden: true },
    ],
    stats: [39, 52, 43, 60, 50, 65],
    description:
      'Preferisce i luoghi caldi. Quando piove si dice che dalla punta della coda esca del vapore.',
  },
  6: {
    height: 17,
    weight: 905,
    abilities: [
      { name: 'blaze', isHidden: false },
      { name: 'solar-power', isHidden: true },
    ],
    stats: [78, 84, 78, 109, 85, 100],
    description: 'Sputa fiamme così calde da fondere le rocce. A volte causa incendi boschivi.',
  },
  7: {
    height: 5,
    weight: 90,
    abilities: [
      { name: 'torrent', isHidden: false },
      { name: 'rain-dish', isHidden: true },
    ],
    stats: [44, 48, 65, 50, 64, 43],
    description: 'Quando ritira il lungo collo nella corazza, spruzza acqua con forza tremenda.',
  },
  25: {
    height: 4,
    weight: 60,
    abilities: [
      { name: 'static', isHidden: false },
      { name: 'lightning-rod', isHidden: true },
    ],
    stats: [35, 55, 40, 50, 50, 90],
    description:
      "Quando si arrabbia scarica subito l'energia accumulata nelle sacche sulle guance.",
  },
  94: {
    height: 15,
    weight: 405,
    abilities: [{ name: 'cursed-body', isHidden: false }],
    stats: [60, 65, 60, 130, 75, 110],
    description:
      "Nelle notti di luna piena si nasconde nell'ombra delle persone e ride della loro paura.",
  },
  131: {
    height: 25,
    weight: 2200,
    abilities: [
      { name: 'water-absorb', isHidden: false },
      { name: 'shell-armor', isHidden: false },
      { name: 'hydration', isHidden: true },
    ],
    stats: [130, 85, 80, 85, 95, 60],
    description:
      'Trasporta persone e Pokémon sul dorso attraverso il mare. Capisce il linguaggio umano.',
  },
};

const GENERIC: Extra = {
  height: 10,
  weight: 100,
  abilities: [{ name: 'run-away', isHidden: false }],
  stats: [60, 60, 60, 60, 60, 60],
  description: null,
};

function extraFor(id: number): Extra {
  return EXTRAS[id] ?? GENERIC;
}

export const MOCK_POKEMON: Pokemon[] = GEN_1.map((entry, index) => {
  const [name, types] = entry.split(':');
  const id = index + 1;
  const extra = extraFor(id);
  return {
    id,
    name,
    types: types.split('/') as TypeName[],
    artworkUrl: getArtworkUrl(id),
    height: extra.height,
    weight: extra.weight,
    abilities: extra.abilities,
    stats: STAT_NAMES.map((stat, i) => ({ name: stat, value: extra.stats[i] })),
  };
});

export function mockDetail(id: number): PokemonDetail | undefined {
  const pokemon = MOCK_POKEMON[id - 1];
  return pokemon && { ...pokemon, description: extraFor(id).description };
}
