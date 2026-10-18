// Genera `src/data/pokemonIndex.json`: per ogni Pokémon del Pokédex nazionale id, nome e
// tipi, così la ricerca trova anche i Pokémon non ancora caricati nell'elenco (es. Sprigatito
// senza scorrere fino al #906). `missingArtwork` elenca gli stili di artwork che PokéAPI non
// ha per quel Pokémon (Dream World e Showdown non coprono tutte le generazioni): l'app ripiega
// sull'artwork ufficiale.
//
//   node scripts/generate-pokemon-index.mjs
//
// Legge i dati statici di PokéAPI (repo PokeAPI/api-data, stessi contenuti dell'API);
// con POKEAPI_BASE=https://pokeapi.co/api/v2 usa invece l'API vera.

import { writeFile } from 'node:fs/promises';

const MIRROR = 'https://raw.githubusercontent.com/PokeAPI/api-data/master/data/api/v2';
const BASE = process.env.POKEAPI_BASE ?? MIRROR;
const OUTPUT = new URL('../src/data/pokemonIndex.json', import.meta.url);

/** Le forme alternative (Mega, Alola…) hanno id da 10001: restano fuori dal Pokédex. */
const MAX_SPECIES_ID = 10000;

const url = (path) => (BASE === MIRROR ? `${BASE}/${path}/index.json` : `${BASE}/${path}/?limit=2000`);
const idFromUrl = (value) => Number(value.match(/\/(\d+)\/?$/)[1]);

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

/** Stili di `ARTWORK_STYLES` (src/api/pokemon.ts) e dove PokéAPI ne dichiara l'immagine. */
const ARTWORK_SPRITES = {
  official: (s) => s.other?.['official-artwork']?.front_default,
  'official-shiny': (s) => s.other?.['official-artwork']?.front_shiny,
  home: (s) => s.other?.home?.front_default,
  'home-shiny': (s) => s.other?.home?.front_shiny,
  'dream-world': (s) => s.other?.dream_world?.front_default,
  showdown: (s) => s.other?.showdown?.front_default,
  sprite: (s) => s.front_default,
};

const list = await getJson('pokemon-species');
const ids = list.results
  .map((s) => idFromUrl(s.url))
  .filter((id) => id <= MAX_SPECIES_ID)
  .sort((a, b) => a - b);

let done = 0;
const index = await mapLimit(ids, 16, async (id) => {
  const raw = await getJson(`pokemon/${id}`);
  if (++done % 100 === 0) console.log(`${done}/${ids.length}`);
  const missingArtwork = Object.entries(ARTWORK_SPRITES)
    .filter(([, sprite]) => !sprite(raw.sprites))
    .map(([style]) => style);
  return {
    id,
    // Il nome della specie: per Deoxys `raw.name` è la forma, «deoxys-normal».
    name: raw.species.name,
    types: [...raw.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    ...(missingArtwork.length ? { missingArtwork } : {}),
  };
});

await writeFile(OUTPUT, `${JSON.stringify(index, null, 0).replace(/\},\{/g, '},\n{')}\n`);
console.log(`${index.length} Pokémon in ${OUTPUT.pathname}`);
