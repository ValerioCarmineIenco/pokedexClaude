import { createIdSetStore } from './idSetStore';

const store = createIdSetStore('pokedex.shinyCaught');

/** Segna il Pokémon come shiny ottenuto, o toglie il segno se c'è già. */
export const toggleShinyCaught = store.toggle;

/** Id dei Pokémon di cui si è ottenuto lo shiny, ricordati tra un'apertura e l'altra. */
export function useShinyCaught() {
  return [store.useIds(), toggleShinyCaught] as const;
}
