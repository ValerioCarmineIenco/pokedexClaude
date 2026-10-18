# Pokédex

App Expo (React Native) per consultare i Pokémon di tutte le generazioni (Kanto, Johto, Hoenn, Sinnoh, Unima, Kalos, Alola, Galar e Paldea, #1–1025), con i dati di [PokéAPI](https://pokeapi.co/).

## Avvio

```bash
npm install
npx expo start
```

Poi apri l'app con Expo Go sul telefono, oppure in un simulatore.

## Struttura

```
src/
├── app/              # rotte Expo Router
│   ├── _layout.tsx   # stack + provider di React Query
│   ├── index.tsx     # Elenco
│   └── pokemon/[id].tsx  # Dettaglio
├── api/              # chiamate a PokéAPI
├── hooks/            # hook dei dati
├── components/       # componenti UI
├── i18n/             # lingue, traduzioni dell'interfaccia e nomi localizzati
├── theme/            # colori e nomi dei tipi
├── types/            # tipi TypeScript delle risposte API
└── utils/            # formattazione
```

## Lingue

L'app è in inglese, italiano, francese, tedesco, spagnolo e giapponese. All'avvio usa la lingua del dispositivo (inglese se non è tra queste); nelle Impostazioni si può sceglierne un'altra, che resta salvata.

- `src/i18n/index.ts` configura i18next; `t`, `getLanguage()`, `getLocale()` e `perLanguage()` servono al codice fuori dai componenti, `useTranslation('<namespace>')` ai componenti.
- I testi dell'interfaccia sono in `src/i18n/locales/<lingua>/<namespace>.json`, un file per area dell'app. L'inglese è il riferimento dei tipi: una chiave che manca in `en` non compila.
- I nomi di Pokémon, mosse, abilità, oggetti, nature, località, regioni, tipi e giochi sono quelli ufficiali di PokéAPI, in `src/data/names/<lingua>.json` (rigenerabili con `node scripts/generate-names.mjs`) e letti con `localName()` di `src/i18n/names.ts`. Descrizioni ed effetti arrivano da PokéAPI nella lingua scelta; quando mancano si usa l'inglese.
- Al cambio di lingua `LanguageGate` rimonta le schermate (la navigazione resta dov'è) e le chiavi di React Query includono la lingua.

## Livello dati

Gli schermi usano solo gli hook di `src/hooks` (React Query); i tipi restituiti sono in `src/types/pokemon.ts` e ricalcano i view model della UI.

| Hook | Restituisce |
| --- | --- |
| `usePokemonList(generationId?)` | `pokemon: Pokemon[]` (tutte le generazioni in sequenza, o solo `generationId`, a pagine da 20), `isLoading`, `errorMessage`, `refetch`, `hasNextPage`, `fetchNextPage`, `isFetchingNextPage` |
| `usePokemonDetail(id)` | `pokemon: PokemonDetail` (dati + descrizione italiana), `isLoading`, `errorMessage`, `refetch` |
| `usePokemon(id)` / `usePokemonSpecies(id)` | le due metà del dettaglio, separate |
| `usePokemonArtworks(id, { enabled })` | `artworks: PokemonArtworks` (tutte le immagini di `sprites`, per fonte e per generazione), `isLoading`, `errorMessage`, `refetch` |
| `usePokemonSearch(testo, generazione)` | i Pokémon della generazione (o di tutte) il cui nome contiene il testo, dall'indice statico `src/data/pokemonIndex.json` |

Ogni `Pokemon` ha `generation` (1, 2 o 3). `GENERATIONS` in `src/api/generations.ts` elenca le generazioni (`id`, `name`, `region`, `firstId`, `lastId`); `fetchGenerationPokemon(id)` in `src/api/pokemon.ts` scarica tutti i Pokémon di una generazione.

`id` può essere direttamente il parametro di rotta. Nomi, altezza (dm) e peso (hg) arrivano come in PokéAPI: la formattazione la fa la UI. `getAdjacentIds` in `src/api/pokemon.ts` dà il Pokémon precedente/successivo; `QueryProvider` in `src/api/QueryProvider.tsx` salva la cache in AsyncStorage e va messo in `_layout.tsx` al posto di `QueryClientProvider`.

### Località

Elenco e dettaglio delle località (`src/api/locations.ts`, tipi in `src/types/location.ts`).

| Hook | Restituisce |
| --- | --- |
| `useLocations({ region, search })` | `locations: LocationSummary[]` (in ordine alfabetico, filtrate per slug di regione e per nome), `sections` (le stesse raggruppate per regione), `regions` (per il selettore), `total`. Tutto dall'indice locale: nessun caricamento |
| `useLocationSearch()` | testo della barra di ricerca e `query` da passare a `useLocations` |
| `useLocation(id)` | `summary` (subito, dall'indice), `location: LocationDetail` (aree → gruppi per metodo → incontri con livelli, probabilità, giochi e condizioni), `isLoading`, `errorMessage`, `refetch` |

Nomi, regioni, contatori di Pokémon e giochi vengono da `src/data/locationIndex.json` e `src/data/encounterMeta.json`, rigenerabili con `node scripts/generate-location-index.mjs`; gli incontri del dettaglio arrivano da `/location/{id}` e `/location-area/{id}` di PokéAPI.
