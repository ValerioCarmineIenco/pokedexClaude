// Genera `src/data/abilityIndex.json`: l'elenco delle abilità mostrate nell'app, con il nome
// italiano (per la ricerca) e gli id dei Pokémon che le possiedono (per tenere solo quelle
// delle generazioni coperte). Descrizioni ed effetti non ci sono: l'app li legge da PokéAPI.
//
//   node scripts/generate-ability-index.mjs
//
// Legge i dati statici di PokéAPI (repo PokeAPI/api-data, stessi contenuti dell'API);
// con POKEAPI_BASE=https://pokeapi.co/api/v2 usa invece l'API vera.

import { writeFile } from 'node:fs/promises';

const MIRROR = 'https://raw.githubusercontent.com/PokeAPI/api-data/master/data/api/v2';
const BASE = process.env.POKEAPI_BASE ?? MIRROR;
const OUTPUT = new URL('../src/data/abilityIndex.json', import.meta.url);

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

const list = await getJson('ability');
const ids = list.results.map((a) => idFromUrl(a.url));

let done = 0;
const abilities = await mapLimit(ids, 16, async (id) => {
  const raw = await getJson(`ability/${id}`);
  if (++done % 100 === 0) console.log(`${done}/${ids.length}`);
  // Le abilità dei giochi spin-off (Pokémon Conquest) non hanno Pokémon né descrizioni utili.
  if (!raw.is_main_series) return null;
  const pokemonIds = [
    ...new Set(raw.pokemon.map((p) => idFromUrl(p.pokemon.url)).filter((n) => n <= MAX_SPECIES_ID)),
  ].sort((a, b) => a - b);
  if (pokemonIds.length === 0) return null;
  const label = (language) => raw.names.find((n) => n.language.name === language)?.name;
  return {
    id,
    name: raw.name,
    // Stesso nome che mostra l'app: italiano, altrimenti inglese.
    label: label('it') ?? label('en') ?? raw.name,
    generation: roman[raw.generation.name.replace('generation-', '')],
    pokemonIds,
  };
});

const index = abilities.filter(Boolean).sort((a, b) => a.id - b.id);
await writeFile(OUTPUT, `${JSON.stringify(index, null, 0).replace(/\},\{/g, '},\n{')}\n`);
console.log(`${index.length} abilità su ${ids.length}`);
