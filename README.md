# Pokédex

App Expo (React Native) per consultare i Pokémon della prima generazione, con i dati di [PokéAPI](https://pokeapi.co/).

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
├── theme/            # colori e nomi italiani dei tipi
├── types/            # tipi TypeScript delle risposte API
└── utils/            # formattazione
```

## Livello dati

Gli schermi usano solo gli hook di `src/hooks` (React Query); i tipi restituiti sono in `src/types/pokemon.ts` e ricalcano i view model della UI.

| Hook | Restituisce |
| --- | --- |
| `usePokemonList()` | `pokemon: Pokemon[]` (Gen 1 a pagine da 20), `isLoading`, `errorMessage`, `refetch`, `hasNextPage`, `fetchNextPage`, `isFetchingNextPage` |
| `usePokemonDetail(id)` | `pokemon: PokemonDetail` (dati + descrizione italiana), `isLoading`, `errorMessage`, `refetch` |
| `usePokemon(id)` / `usePokemonSpecies(id)` | le due metà del dettaglio, separate |
| `usePokemonArtworks(id, { enabled })` | `artworks: PokemonArtworks` (tutte le immagini di `sprites`, per fonte e per generazione), `isLoading`, `errorMessage`, `refetch` |
| `usePokemonSearch(pokemon, testo)` | i Pokémon già caricati filtrati per nome |

`id` può essere direttamente il parametro di rotta. Nomi, altezza (dm) e peso (hg) arrivano come in PokéAPI: la formattazione la fa la UI. `getAdjacentIds` in `src/api/pokemon.ts` dà il Pokémon precedente/successivo; `QueryProvider` in `src/api/QueryProvider.tsx` salva la cache in AsyncStorage e va messo in `_layout.tsx` al posto di `QueryClientProvider`.
