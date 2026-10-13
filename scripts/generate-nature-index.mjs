// Genera `src/data/natureIndex.json`: l'elenco delle nature con il nome italiano, per la
// ricerca locale. Statistiche e sapori non ci sono: l'app li legge da PokéAPI.
//
//   node scripts/generate-nature-index.mjs
//
// Legge i dati statici di PokéAPI (repo PokeAPI/api-data, stessi contenuti dell'API);
// con POKEAPI_BASE=https://pokeapi.co/api/v2 usa invece l'API vera.

import { writeFile } from 'node:fs/promises';

const MIRROR = 'https://raw.githubusercontent.com/PokeAPI/api-data/master/data/api/v2';
const BASE = process.env.POKEAPI_BASE ?? MIRROR;
const OUTPUT = new URL('../src/data/natureIndex.json', import.meta.url);

const url = (path) => (BASE === MIRROR ? `${BASE}/${path}/index.json` : `${BASE}/${path}/?limit=1000`);
const idFromUrl = (value) => Number(value.match(/\/(\d+)\/?$/)[1]);

async function getJson(path) {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url(path));
    if (response.ok) return response.json();
    if (attempt === 3) throw new Error(`${response.status} su ${url(path)}`);
  }
}

const list = await getJson('nature');
const natures = await Promise.all(
  list.results.map(async (entry) => {
    const id = idFromUrl(entry.url);
    const raw = await getJson(`nature/${id}`);
    const label = (language) => raw.names.find((n) => n.language.name === language)?.name;
    // Stesso nome che mostra l'app: italiano, altrimenti inglese.
    return { id, name: raw.name, label: label('it') ?? label('en') ?? raw.name };
  }),
);

const index = natures.sort((a, b) => a.id - b.id);
await writeFile(OUTPUT, `${JSON.stringify(index, null, 0).replace(/\},\{/g, '},\n{')}\n`);
console.log(`${index.length} nature`);
