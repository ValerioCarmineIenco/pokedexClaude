import { createIdSetStore } from './idSetStore';

const store = createIdSetStore('pokedex.favorites');

/** Aggiunge il Pokémon ai preferiti, o lo toglie se c'è già. */
export const toggleFavorite = store.toggle;

/** Id dei preferiti in questo momento e sostituzione in blocco, per il backup. */
export const getFavorites = store.getIds;
export const replaceFavorites = store.replace;

/** Id dei Pokémon preferiti, ricordati tra un'apertura e l'altra. */
export function useFavorites() {
  return [store.useIds(), toggleFavorite] as const;
}
