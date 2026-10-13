// Genera `src/data/moveIndex.json`: l'elenco delle mosse con tutto quello che serve alla
// lista (nome italiano, tipo, classe di danno, potenza, precisione, PP), così elenco e
// ricerca non fanno chiamate. Descrizioni, effetti e Pokémon che le imparano non ci sono:
// l'app li legge da PokéAPI aprendo il dettaglio.
//
//   node scripts/generate-move-index.mjs
//
// Legge i dati statici di PokéAPI (repo PokeAPI/api-data, stessi contenuti dell'API);
// con POKEAPI_BASE=https://pokeapi.co/api/v2 usa invece l'API vera.

import { writeFile } from 'node:fs/promises';

const MIRROR = 'https://raw.githubusercontent.com/PokeAPI/api-data/master/data/api/v2';
const BASE = process.env.POKEAPI_BASE ?? MIRROR;
const OUTPUT = new URL('../src/data/moveIndex.json', import.meta.url);

/** Le forme alternative (Mega, Alola…) hanno id da 10001: restano fuori dal Pokédex. */
const MAX_SPECIES_ID = 10000;

const url = (path) => (BASE === MIRROR ? `${BASE}/${path}/index.json` : `${BASE}/${path}/?limit=1000`);
const idFromUrl = (value) => Number(value.match(/\/(\d+)\/?$/)[1]);
const roman = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9 };

async function getJson(path) {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url(path));
    if (response.ok) return response.json();
    if (attempt === 3) throw new Error(`${response.status} su ${url(path)}`);
  }
}

/** Esegue `task` su ogni elemento, al massimo `limit` alla volta. */
async function mapLimit(values, limit, task) {
  const results = new Array(values.length);
  let next = 0;
  const worker = async () => {
    while (next < values.length) {
      const index = next++;
      results[index] = await task(values[index]);
    }
  };
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

const list = await getJson('move');
const ids = list.results.map((m) => idFromUrl(m.url));

let done = 0;
const moves = await mapLimit(ids, 16, async (id) => {
  const raw = await getJson(`move/${id}`);
  if (++done % 100 === 0) console.log(`${done}/${ids.length}`);
  // Mosse Z, Dynamax e Ombra non le impara nessun Pokémon: restano fuori, come le mosse
  // dei soli Pokémon fuori dal Pokédex (vedi `firstPokemonId`).
  const learners = raw.learned_by_pokemon.map((p) => idFromUrl(p.url)).filter((n) => n <= MAX_SPECIES_ID);
  if (learners.length === 0 || raw.type.name === 'shadow') return null;
  const label = (language) => raw.names.find((n) => n.language.name === language)?.name;
  return {
    id,
    name: raw.name,
    // Stesso nome che mostra l'app: italiano, altrimenti inglese.
    label: label('it') ?? label('en') ?? raw.name,
    type: raw.type.name,
    damageClass: raw.damage_class.name,
    power: raw.power,
    accuracy: raw.accuracy,
    pp: raw.pp,
    generation: roman[raw.generation.name.replace('generation-', '')],
    firstPokemonId: Math.min(...learners),
  };
});

const index = moves.filter(Boolean).sort((a, b) => a.id - b.id);
await writeFile(OUTPUT, `${JSON.stringify(index, null, 0).replace(/\},\{/g, '},\n{')}\n`);
console.log(`${index.length} mosse su ${ids.length}`);
