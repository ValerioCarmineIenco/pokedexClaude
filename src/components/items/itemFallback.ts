import type { ItemCategory } from '@/types/item';

// Ripiego locale delle tonalità per categoria, finché `src/theme/categoryColors.ts`
// (thread del dettaglio oggetto) non è su main. Stessi campi usati qui: poi basta
// cambiare l'import in `ItemCard.tsx` e cancellare questo file.

export type CategoryColors = {
  /** Colore pieno: etichette, accenti. */
  color: string;
  /** Sfondo tenue di carte e riquadri. */
  soft: string;
};

const NEUTRAL: CategoryColors = { color: '#8A8792', soft: '#ECEAE6' };

/** Tonalità neutra per tutte le categorie, in attesa del tema colori degli oggetti. */
export function getCategoryColors(_category: ItemCategory): CategoryColors {
  return NEUTRAL;
}
