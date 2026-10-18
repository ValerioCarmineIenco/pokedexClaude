import { createIdSetStore } from './idSetStore';

const store = createIdSetStore('pokedex.shinyCaught');

/** Segna il Pokémon come shiny ottenuto, o toglie il segno se c'è già. */
export const toggleShinyCaught = store.toggle;

/** Id degli shiny ottenuti in questo momento e sostituzione in blocco, per il backup. */
export const getShinyCaught = store.getIds;
export const replaceShinyCaught = store.replace;

/** Id dei Pokémon di cui si è ottenuto lo shiny, ricordati tra un'apertura e l'altra. */
export function useShinyCaught() {
  return [store.useIds(), toggleShinyCaught] as const;
}
