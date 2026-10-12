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

Gli schermi usano solo gli hook di `src/hooks` (React Query, cache salvata in AsyncStorage):

| Hook | Restituisce |
| --- | --- |
| `usePokemonList()` | `pokemon`, `isLoading`, `errorMessage`, `refetch`, `hasNextPage`, `fetchNextPage`, `isFetchingNextPage` — Gen 1 a pagine da 20 |
| `usePokemon(id)` | `pokemon` con tipi, altezza (m), peso (kg), abilità, statistiche con etichette italiane |
| `usePokemonSpecies(id)` | `species.description` (italiano) e `species.genus` |
| `usePokemonSearch(pokemon, testo)` | i Pokémon già caricati filtrati per nome |

`id` può essere direttamente il parametro di rotta. Nomi dei tipi in italiano in `src/theme/typeNames.ts`, formattazione (#025, m, kg) in `src/utils/format.ts`, Pokémon precedente/successivo con `getAdjacentIds` in `src/api/pokemon.ts`.
