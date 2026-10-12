// Ripieghi locali della lista oggetti, finché i thread dati e colori non sono su main.
// Quando arrivano `src/types/item.ts`, l'hook della lista e `getCategoryColors`,
// questo file si cancella e gli import puntano a quelli veri.

/** Categoria dell'oggetto, come slug di PokéAPI (es. `healing`, `all-machines`). */
export type ItemCategory = string;

export type Item = {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  category: ItemCategory;
  relatedIds: number[];
};

export type CategoryColors = {
  /** Tinta chiara dietro l'immagine. */
  background: string;
  /** Colore pieno della categoria. */
  accent: string;
};

const NEUTRAL: CategoryColors = { background: '#ECEAE6', accent: '#8A8792' };

/** Tonalità neutra per tutte le categorie, in attesa del tema colori degli oggetti. */
export function getCategoryColors(_category: ItemCategory): CategoryColors {
  return NEUTRAL;
}

const sprite = (slug: string) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${slug}.png`;

const item = (
  id: number,
  slug: string,
  name: string,
  category: ItemCategory,
  description: string,
): Item => ({ id, name, description, imageUrl: sprite(slug), category, relatedIds: [] });

/** Un assaggio di oggetti veri, per sviluppare la UI senza rete. */
export const FALLBACK_ITEMS: Item[] = [
  item(1, 'master-ball', 'Master Ball', 'standard-balls', 'La Ball più efficace: cattura sempre il Pokémon selvatico.'),
  item(2, 'ultra-ball', 'Ultra Ball', 'standard-balls', 'Una Ball molto efficace, migliore della Mega Ball.'),
  item(3, 'great-ball', 'Mega Ball', 'standard-balls', 'Una Ball efficace, migliore della Poké Ball.'),
  item(4, 'poke-ball', 'Poké Ball', 'standard-balls', 'Uno strumento per catturare i Pokémon selvatici.'),
  item(17, 'potion', 'Pozione', 'healing', 'Uno spray che cura le ferite: ripristina 20 PS a un Pokémon.'),
  item(26, 'super-potion', 'Superpozione', 'healing', 'Uno spray che cura le ferite: ripristina 50 PS a un Pokémon.'),
  item(25, 'hyper-potion', 'Iperpozione', 'healing', 'Uno spray che cura le ferite: ripristina 200 PS a un Pokémon.'),
  item(24, 'max-potion', 'Pozione Max', 'healing', 'Uno spray che ripristina del tutto i PS di un Pokémon.'),
  item(18, 'antidote', 'Antidoto', 'status-cures', 'Uno spray che cura un Pokémon dall’avvelenamento.'),
  item(28, 'revive', 'Revitalizzante', 'revival', 'Rianima un Pokémon esausto e ripristina metà dei suoi PS.'),
  item(126, 'cheri-berry', 'Baccaliegia', 'medicine', 'Se tenuta da un Pokémon, lo cura dalla paralisi.'),
  item(80, 'fire-stone', 'Pietrafocaia', 'evolution', 'Una pietra speciale che fa evolvere alcuni Pokémon.'),
  item(85, 'thunder-stone', 'Pietratuono', 'evolution', 'Una pietra speciale che fa evolvere alcuni Pokémon.'),
  item(305, 'tm-normal', 'MT01', 'all-machines', 'Insegna a un Pokémon la mossa Granpugno.'),
  item(306, 'tm-dragon', 'MT02', 'all-machines', 'Insegna a un Pokémon la mossa Dragartigli.'),
  item(667, 'venusaurite', 'Venusaurite', 'mega-stones', 'Una Megapietra: permette a Venusaur di megaevolversi.'),
  item(668, 'charizardite-x', 'Charizardite X', 'mega-stones', 'Una Megapietra: permette a Charizard di megaevolversi.'),
  item(214, 'leftovers', 'Avanzi', 'held-items', 'Il Pokémon che lo tiene recupera un po’ di PS a ogni turno.'),
];
