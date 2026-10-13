// Genera i due file della sezione «Località»:
// - `src/data/locationIndex.json`: le località con almeno un incontro, con nome, regione e
//   gli id di Pokémon e giochi che servono all'elenco (contatori, ricerca, filtro per regione).
// - `src/data/encounterMeta.json`: regioni, giochi, metodi e condizioni d'incontro con i
//   nomi da mostrare, perché le risposte di `/location-area` riportano solo gli slug.
// Gli incontri veri e propri non ci sono: il dettaglio li legge da PokéAPI.
//
//   node scripts/generate-location-index.mjs
//
// Legge i dati statici di PokéAPI (repo PokeAPI/api-data, stessi contenuti dell'API);
// con POKEAPI_BASE=https://pokeapi.co/api/v2 usa invece l'API vera.

import { writeFile } from 'node:fs/promises';

const MIRROR = 'https://raw.githubusercontent.com/PokeAPI/api-data/master/data/api/v2';
const BASE = process.env.POKEAPI_BASE ?? MIRROR;
const INDEX_OUTPUT = new URL('../src/data/locationIndex.json', import.meta.url);
const META_OUTPUT = new URL('../src/data/encounterMeta.json', import.meta.url);

const url = (path) => (BASE === MIRROR ? `${BASE}/${path}/index.json` : `${BASE}/${path}/?limit=2000`);
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

const nameIn = (raw, language) => raw.names.find((n) => n.language.name === language)?.name;
/** Stesso nome che mostra l'app: italiano, altrimenti inglese, altrimenti lo slug. */
const label = (raw) => nameIn(raw, 'it') ?? nameIn(raw, 'en') ?? raw.name;
const ids = (list) => list.results.map((entry) => idFromUrl(entry.url));

/** Tutte le voci di una risorsa, scaricate una per una. */
async function getAll(resource, transform) {
  const list = ids(await getJson(resource));
  let done = 0;
  return mapLimit(list, 16, async (id) => {
    const raw = await getJson(`${resource}/${id}`);
    if (++done % 200 === 0) console.log(`${resource}: ${done}/${list.length}`);
    return transform(raw);
  });
}

// --- Metadati ---------------------------------------------------------------

const regions = await getAll('region', (raw) => ({ id: raw.id, name: raw.name, label: label(raw) }));

const versionGroups = new Map(
  (
    await getAll('version-group', (raw) => [
      raw.name,
      roman[raw.generation.name.replace('generation-', '')],
    ])
  ).map(([name, generation]) => [name, generation]),
);
const versions = await getAll('version', (raw) => ({
  id: raw.id,
  name: raw.name,
  // Rossa, Verde e Blu giapponesi hanno gli stessi nomi di quelle occidentali.
  label: raw.name.endsWith('-japan') ? `${label(raw)} (Giappone)` : label(raw),
  generation: versionGroups.get(raw.version_group.name) ?? 0,
}));

// Metodi e condizioni hanno i nomi solo in inglese (e tedesco, francese): l'italiano dei
// casi comuni lo aggiunge l'app, qui resta l'inglese come ripiego.
const methods = await getAll('encounter-method', (raw) => ({
  id: raw.id,
  name: raw.name,
  label: nameIn(raw, 'en') ?? raw.name,
  order: raw.order,
}));
const conditions = await getAll('encounter-condition-value', (raw) => ({
  id: raw.id,
  name: raw.name,
  condition: raw.condition.name,
  label: nameIn(raw, 'en') ?? raw.name,
}));

// --- Località ---------------------------------------------------------------

/** Pokémon e giochi di ogni area, per id. */
const areas = new Map(
  await getAll('location-area', (raw) => {
    const pokemonIds = new Set();
    const versionIds = new Set();
    for (const encounter of raw.pokemon_encounters) {
      pokemonIds.add(idFromUrl(encounter.pokemon.url));
      for (const detail of encounter.version_details) versionIds.add(idFromUrl(detail.version.url));
    }
    return [raw.id, { pokemonIds, versionIds }];
  }),
);

const sortedNumbers = (set) => [...set].sort((a, b) => a - b);

const locations = await getAll('location', (raw) => {
  const pokemonIds = new Set();
  const versionIds = new Set();
  for (const area of raw.areas) {
    const data = areas.get(idFromUrl(area.url));
    if (!data) continue;
    data.pokemonIds.forEach((id) => pokemonIds.add(id));
    data.versionIds.forEach((id) => versionIds.add(id));
  }
  // Senza incontri il dettaglio sarebbe vuoto: la località resta fuori dall'elenco.
  if (pokemonIds.size === 0) return null;
  const english = nameIn(raw, 'en');
  const shown = label(raw);
  return {
    id: raw.id,
    name: raw.name,
    label: shown,
    // Il nome inglese serve alla ricerca quando quello mostrato è italiano.
    ...(english && english !== shown ? { englishLabel: english } : {}),
    region: raw.region?.name ?? null,
    pokemonIds: sortedNumbers(pokemonIds),
    versionIds: sortedNumbers(versionIds),
  };
});

const index = locations.filter(Boolean).sort((a, b) => a.id - b.id);
const byId = (a, b) => a.id - b.id;
const meta = {
  regions: regions.sort(byId),
  versions: versions.sort(byId),
  methods: methods.sort(byId),
  conditions: conditions.sort(byId),
};

const lines = (array) => `[${array.map((entry) => JSON.stringify(entry)).join(',\n')}]`;
await writeFile(INDEX_OUTPUT, `${lines(index)}\n`);
await writeFile(
  META_OUTPUT,
  `{\n${Object.entries(meta)
    .map(([key, array]) => `"${key}": ${lines(array)}`)
    .join(',\n')}\n}\n`,
);
console.log(`${index.length} località con incontri su ${locations.length}`);
