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
