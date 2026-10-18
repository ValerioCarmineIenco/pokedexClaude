// Genera `src/data/names/<lingua>.json`: i nomi localizzati di Pokémon, mosse, abilità,
// oggetti, nature, località, regioni, tipi, statistiche, giochi, metodi e condizioni di
// incontro nelle lingue dell'app, così elenchi e ricerche non fanno chiamate.
//
//   node scripts/generate-names.mjs
//
// Legge i CSV del repo PokeAPI/pokeapi (gli stessi dati dell'API) e tiene solo gli id
// presenti negli indici di `src/data`. Una voce che manca in una lingua resta fuori:
// l'app ripiega sull'inglese.

import { mkdir, readFile, writeFile } from 'node:fs/promises';

const CSV_BASE = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv';
const DATA = new URL('../src/data/', import.meta.url);

/** Lingue dell'app → id delle lingue di PokéAPI, in ordine di preferenza. */
const LANGUAGES = {
  en: [9],
  it: [8],
  fr: [5],
  de: [6],
  es: [7],
  // Giapponese con i kanji dei giochi recenti, altrimenti in kana.
  ja: [11, 1],
};

const readJson = async (file) => JSON.parse(await readFile(new URL(file, DATA), 'utf8'));

/** CSV con campi tra virgolette (alcuni nomi contengono virgole). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') field += char;
  }
  if (field || row.length) rows.push([...row, field]);
  const [header, ...body] = rows;
  return body.map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ''])));
}

async function getCsv(name) {
  const response = await fetch(`${CSV_BASE}/${name}.csv`);
  if (!response.ok) throw new Error(`${response.status} su ${name}.csv`);
  return parseCsv(await response.text());
}

/**
 * Nomi di una tabella `<x>_names`/`<x>_prose`: { lingua: { chiave: nome } }. `keyOf` converte
 * l'id della riga nella chiave usata dall'app (id o slug); null la salta.
 */
async function names(table, idColumn, keyOf, nameColumn = 'name') {
  const rows = await getCsv(table);
  const result = {};
  for (const [language, ids] of Object.entries(LANGUAGES)) {
    const entries = {};
    // Dalla lingua meno preferita alla più preferita: l'ultima scritta vince.
    for (const languageId of [...ids].reverse()) {
      for (const row of rows) {
        if (Number(row.local_language_id) !== languageId || !row[nameColumn]) continue;
        const key = keyOf(Number(row[idColumn]));
        if (key != null) entries[key] = row[nameColumn].trim();
      }
    }
    result[language] = entries;
  }
  return result;
}

/** Id da tenere (presenti nell'indice) → la chiave è l'id stesso. */
const onlyIds = (ids) => {
  const wanted = new Set(ids);
  return (id) => (wanted.has(id) ? id : null);
};

/** Tabella `identifier` → la chiave è lo slug. */
async function slugs(table) {
  const rows = await getCsv(table);
  const map = new Map(rows.map((row) => [Number(row.id), row.identifier]));
  return (id) => map.get(id) ?? null;
}

const [pokemonIndex, moveIndex, abilityIndex, itemIndex, natureIndex, locationIndex, meta] = await Promise.all(
  [
    'pokemonIndex.json',
    'moveIndex.json',
    'abilityIndex.json',
    'itemIndex.json',
    'natureIndex.json',
    'locationIndex.json',
    'encounterMeta.json',
  ].map(readJson),
);

const typeSlug = await slugs('types');
const statSlug = await slugs('stats');

const tables = {
  pokemon: await names('pokemon_species_names', 'pokemon_species_id', onlyIds(pokemonIndex.map((p) => p.id))),
  move: await names('move_names', 'move_id', onlyIds(moveIndex.map((m) => m.id))),
  ability: await names('ability_names', 'ability_id', onlyIds(abilityIndex.map((a) => a.id))),
  item: await names('item_names', 'item_id', onlyIds(itemIndex.map((i) => i.id))),
  nature: await names('nature_names', 'nature_id', onlyIds(natureIndex.map((n) => n.id))),
  location: await names('location_names', 'location_id', onlyIds(locationIndex.map((l) => l.id))),
  region: await names('region_names', 'region_id', onlyIds(meta.regions.map((r) => r.id))),
  type: await names('type_names', 'type_id', typeSlug),
  stat: await names('stat_names', 'stat_id', statSlug),
  version: await names('version_names', 'version_id', onlyIds(meta.versions.map((v) => v.id))),
  encounterMethod: await names(
    'encounter_method_prose',
    'encounter_method_id',
    onlyIds(meta.methods.map((m) => m.id)),
  ),
  encounterCondition: await names(
    'encounter_condition_value_prose',
    'encounter_condition_value_id',
    onlyIds(meta.conditions.map((c) => c.id)),
  ),
};

// L'italiano manca per molte località e qualche gioco: gli indici hanno già i nomi italiani
// scritti a mano (`label`), che riempiono i buchi prima di ripiegare sull'inglese.
const italianLabels = {
  move: moveIndex,
  ability: abilityIndex,
  item: itemIndex,
  nature: natureIndex,
  location: locationIndex,
  region: meta.regions,
  version: meta.versions,
};
for (const [kind, entries] of Object.entries(italianLabels)) {
  for (const entry of entries) tables[kind].it[entry.id] ??= entry.label;
}

// PokéAPI non ha i nomi spagnoli delle regioni: sono quelli dei giochi.
Object.assign(tables.region.es, {
  1: 'Kanto',
  2: 'Johto',
  3: 'Hoenn',
  4: 'Sinnoh',
  5: 'Teselia',
  6: 'Kalos',
  7: 'Alola',
  8: 'Galar',
  9: 'Hisui',
  10: 'Paldea',
  11: 'Orre',
});

await mkdir(new URL('names/', DATA), { recursive: true });
for (const language of Object.keys(LANGUAGES)) {
  const output = Object.fromEntries(Object.entries(tables).map(([kind, byLanguage]) => [kind, byLanguage[language]]));
  const lines = Object.entries(output).map(([kind, entries]) => `${JSON.stringify(kind)}:${JSON.stringify(entries)}`);
  await writeFile(new URL(`names/${language}.json`, DATA), `{\n${lines.join(',\n')}\n}\n`);
  const counts = Object.entries(output).map(([kind, entries]) => `${kind} ${Object.keys(entries).length}`);
  console.log(`${language}: ${counts.join(', ')}`);
}
