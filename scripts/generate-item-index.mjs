// Genera `src/data/itemIndex.json`: l'elenco degli oggetti mostrati nell'app, con la
// loro categoria e il nome italiano (per la ricerca). Le descrizioni non ci sono: l'app le
// legge da PokéAPI quando servono.
//
//   node scripts/generate-item-index.mjs
//
// Legge i dati statici di PokéAPI (repo PokeAPI/api-data, stessi contenuti dell'API);
// con POKEAPI_BASE=https://pokeapi.co/api/v2 usa invece l'API vera.

import { writeFile } from 'node:fs/promises';

const MIRROR = 'https://raw.githubusercontent.com/PokeAPI/api-data/master/data/api/v2';
const BASE = process.env.POKEAPI_BASE ?? MIRROR;
const SPRITE_PREFIX = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/';
const OUTPUT = new URL('../src/data/itemIndex.json', import.meta.url);

/**
 * Categoria PokéAPI (`/item-category/{slug}`) → `ItemCategory` dell'app.
 * Le categorie assenti sono escluse: strumenti chiave, posta, ingredienti, cristalli
 * Dynamax, caramelle specifiche, materiali MT, picnic e Teralite (quasi tutti senza
 * immagine o senza descrizione).
 */
const CATEGORY_MAP = {
  // Tasca «Rimedi»
  healing: 'remedies',
  'pp-recovery': 'remedies',
  revival: 'remedies',
  'status-cures': 'remedies',
  vitamins: 'remedies',
  'nature-mints': 'remedies',
  // Tasca «Poké Ball»
  'standard-balls': 'pokeballs',
  'special-balls': 'pokeballs',
  'apricorn-balls': 'pokeballs',
  // Tasca «MT/MN» (comprende anche MN e DT)
  'all-machines': 'tm',
  'mega-stones': 'megaStones',
  // Tasca «Bacche»
  'effort-drop': 'berries',
  medicine: 'berries',
  other: 'berries',
  'in-a-pinch': 'berries',
  'picky-healing': 'berries',
  'type-protection': 'berries',
  'baking-only': 'berries',
  'catching-bonus': 'berries',
  // Strumenti da lotta e strumenti da tenere in lotta
  'stat-boosts': 'battle',
  flutes: 'battle',
  'miracle-shooter': 'battle',
  'held-items': 'battle',
  choice: 'battle',
  'bad-held-items': 'battle',
  'type-enhancement': 'battle',
  jewels: 'battle',
  plates: 'battle',
  'species-specific': 'battle',
  memories: 'battle',
  'z-crystals': 'battle',
  evolution: 'evolution',
  // Il resto della tasca «Strumenti»
  collectibles: 'other',
  spelunking: 'other',
  'effort-training': 'other',
  training: 'other',
  loot: 'other',
  mulch: 'other',
  scarves: 'other',
  'dex-completion': 'other',
};

const url = (path) => (BASE === MIRROR ? `${BASE}/${path}/index.json` : `${BASE}/${path}/?limit=100`);
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

// Il mirror ha solo i percorsi per id: gli slug si risolvono dall'elenco.
const categoryList = await getJson('item-category');
const categoryIds = categoryList.results
  .filter((c) => c.name in CATEGORY_MAP)
  .map((c) => idFromUrl(c.url));
const categories = await mapLimit(categoryIds, 8, (id) => getJson(`item-category/${id}`));
const refs = categories.flatMap((c) => c.items.map((item) => ({ id: idFromUrl(item.url), group: c.name })));

let done = 0;
const items = await mapLimit(refs, 16, async ({ id, group }) => {
  const raw = await getJson(`item/${id}`);
  if (++done % 100 === 0) console.log(`${done}/${refs.length}`);
  const sprite = raw.sprites?.default;
  // Senza immagine l'oggetto non si può mostrare in griglia: lo saltiamo.
  if (!sprite?.startsWith(SPRITE_PREFIX)) return null;
  const file = sprite.slice(SPRITE_PREFIX.length).replace(/\.png$/, '');
  const label = (language) => raw.names.find((n) => n.language.name === language)?.name;
  return {
    id,
    name: raw.name,
    // Stesso nome che mostra l'app: italiano, altrimenti inglese.
    label: label('it') ?? label('en') ?? raw.name,
    group,
    category: CATEGORY_MAP[group],
    // Solo se diverso dal nome (es. le MT usano tutte `tm-normal`).
    ...(file !== raw.name && { sprite: file }),
  };
});

const index = items.filter(Boolean).sort((a, b) => a.id - b.id);
await writeFile(OUTPUT, `${JSON.stringify(index, null, 0).replace(/\},\{/g, '},\n{')}\n`);

const counts = Object.groupBy(index, (item) => item.category);
console.log(`${index.length} oggetti su ${refs.length}:`);
for (const [category, list] of Object.entries(counts)) console.log(`  ${category}: ${list.length}`);
