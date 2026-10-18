// Genera `src/data/typeIndex.json`: la tabella delle efficacie 18×18 e i tipi di ogni
// Pokémon del Pokédex, così la sezione Tipi funziona subito e anche offline.
//
//   node scripts/generate-type-index.mjs
//
// Legge i dati statici di PokéAPI (repo PokeAPI/api-data, stessi contenuti dell'API);
// con POKEAPI_BASE=https://pokeapi.co/api/v2 usa invece l'API vera.

import { writeFile } from 'node:fs/promises';

const MIRROR = 'https://raw.githubusercontent.com/PokeAPI/api-data/master/data/api/v2';
const BASE = process.env.POKEAPI_BASE ?? MIRROR;
const OUTPUT = new URL('../src/data/typeIndex.json', import.meta.url);

// Stesso ordine di TYPE_NAMES in src/types/pokemon.ts; Astrale e Ombra restano fuori.
const TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground',
  'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];
// Ultimo id nazionale (LAST_POKEMON_ID): le forme alternative (da 10001) restano fuori.
const LAST_POKEMON_ID = 1025;

const url = (path) => (BASE === MIRROR ? `${BASE}/${path}/index.json` : `${BASE}/${path}`);
const idFromUrl = (value) => Number(value.match(/\/(\d+)\/?$/)[1]);

async function getJson(path) {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url(path));
    if (response.ok) return response.json();
    if (attempt === 3) throw new Error(`${response.status} su ${url(path)}`);
  }
}

// Il mirror indicizza i tipi per id: si passa dall'elenco per trovarli.
const typeList = await getJson(BASE === MIRROR ? 'type' : 'type/?limit=100');
const typeIds = new Map(typeList.results.map((entry) => [entry.name, idFromUrl(entry.url)]));
const raws = await Promise.all(TYPES.map((type) => getJson(`type/${typeIds.get(type)}`)));

// chart[attaccante][difensore]: solo i moltiplicatori diversi da ×1.
const chart = {};
const pokemon = new Map();
for (const raw of raws) {
  const relations = raw.damage_relations;
  const row = {};
  for (const { name } of relations.double_damage_to) row[name] = 2;
  for (const { name } of relations.half_damage_to) row[name] = 0.5;
  for (const { name } of relations.no_damage_to) row[name] = 0;
  chart[raw.name] = Object.fromEntries(TYPES.filter((type) => type in row).map((type) => [type, row[type]]));

  for (const { slot, pokemon: resource } of raw.pokemon) {
    const id = idFromUrl(resource.url);
    if (id > LAST_POKEMON_ID) continue;
    const entry = pokemon.get(id) ?? { id, name: resource.name, types: [] };
    entry.types[slot - 1] = raw.name;
    pokemon.set(id, entry);
  }
}

const list = [...pokemon.values()]
  .sort((a, b) => a.id - b.id)
  .map((entry) => ({ ...entry, types: entry.types.filter(Boolean) }));
if (list.length !== LAST_POKEMON_ID) throw new Error(`Attesi ${LAST_POKEMON_ID} Pokémon, trovati ${list.length}`);

const body = [
  '{"chart":{',
  TYPES.map((type) => `${JSON.stringify(type)}:${JSON.stringify(chart[type])}`).join(',\n'),
  '},\n"pokemon":[',
  list.map((entry) => JSON.stringify(entry)).join(',\n'),
  ']}\n',
].join('\n');
await writeFile(OUTPUT, body);
console.log(`${TYPES.length} tipi, ${list.length} Pokémon`);
