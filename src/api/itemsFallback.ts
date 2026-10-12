// Dati di ripiego per il dettaglio oggetto, finché non arriva il layer dati oggetti.
// Stessa forma del contratto: `Item`, `getItem(id)`, `getRelatedItems(id)`.

export type ItemCategory =
  | 'remedies'
  | 'tm'
  | 'megaStones'
  | 'pokeballs'
  | 'battle'
  | 'berries'
  | 'evolution'
  | 'other';

export type Item = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  category: ItemCategory;
  relatedIds: number[];
};

const sprite = (slug: string) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${slug}.png`;

type Seed = [id: number, slug: string, name: string, category: ItemCategory, description: string];

const SEEDS: Seed[] = [
  [1, 'master-ball', 'Master Ball', 'pokeballs', 'La Ball più efficace: cattura qualsiasi Pokémon selvatico senza fallire.'],
  [2, 'ultra-ball', 'Ultra Ball', 'pokeballs', 'Una Ball ad alte prestazioni, più efficace della Mega Ball.'],
  [3, 'great-ball', 'Mega Ball', 'pokeballs', 'Una buona Ball, più efficace della Poké Ball.'],
  [4, 'poke-ball', 'Poké Ball', 'pokeballs', 'Uno strumento per catturare i Pokémon selvatici.'],
  [17, 'potion', 'Pozione', 'remedies', 'Spray medicinale che ripristina 20 PS di un Pokémon.'],
  [26, 'super-potion', 'Superpozione', 'remedies', 'Spray medicinale che ripristina 60 PS di un Pokémon.'],
  [25, 'hyper-potion', 'Iperpozione', 'remedies', 'Spray medicinale che ripristina 120 PS di un Pokémon.'],
  [24, 'max-potion', 'Pozione Max', 'remedies', 'Spray medicinale che ripristina tutti i PS di un Pokémon.'],
  [23, 'full-restore', 'Ricarica Totale', 'remedies', 'Ripristina tutti i PS e cura ogni problema di stato.'],
  [18, 'antidote', 'Antidoto', 'remedies', 'Spray medicinale che cura un Pokémon avvelenato.'],
  [81, 'moon-stone', 'Pietralunare', 'evolution', 'Una pietra particolare che fa evolvere alcuni Pokémon.'],
  [82, 'fire-stone', 'Pietrafocaia', 'evolution', 'Una pietra particolare che fa evolvere alcuni Pokémon. È di colore rosso.'],
  [83, 'thunder-stone', 'Pietratuono', 'evolution', 'Una pietra particolare che fa evolvere alcuni Pokémon. Ha un motivo a saetta.'],
  [84, 'water-stone', 'Pietraidrica', 'evolution', 'Una pietra particolare che fa evolvere alcuni Pokémon. È di colore blu.'],
  [85, 'leaf-stone', 'Pietrafoglia', 'evolution', 'Una pietra particolare che fa evolvere alcuni Pokémon. Ha un motivo a foglia.'],
  [132, 'oran-berry', 'Baccarancia', 'berries', 'Se tenuta da un Pokémon, ripristina 10 PS quando sono bassi.'],
  [135, 'sitrus-berry', 'Baccacedro', 'berries', 'Se tenuta da un Pokémon, ripristina un quarto dei PS quando sono bassi.'],
  [55, 'x-attack', 'Attacco X', 'battle', 'Aumenta l’Attacco di un Pokémon durante la lotta.'],
  [305, 'tm-normal', 'MT01', 'tm', 'Insegna una mossa a un Pokémon compatibile.'],
  [673, 'venusaurite', 'Venusaurite', 'megaStones', 'Una Megapietra: se tenuta da Venusaur, gli permette di megaevolversi.'],
  [999, 'mystery-item', 'Oggetto misterioso', 'other', 'Un oggetto senza categoria, utile a provare il colore di ripiego.'],
];

const ITEMS: Item[] = SEEDS.map(([id, slug, name, category, description]) => ({
  id,
  name,
  description,
  imageUrl: sprite(slug),
  category,
  relatedIds: [],
}));

// I correlati sono gli altri oggetti della stessa categoria.
for (const item of ITEMS) {
  item.relatedIds = ITEMS.filter((o) => o.category === item.category && o.id !== item.id).map(
    (o) => o.id,
  );
}

const BY_ID = new Map(ITEMS.map((item) => [item.id, item]));

const delay = () => new Promise((resolve) => setTimeout(resolve, 250));

export async function getItem(id: number): Promise<Item> {
  await delay();
  const item = BY_ID.get(id);
  if (!item) throw new Error('Oggetto non trovato.');
  return item;
}

export async function getRelatedItems(id: number): Promise<Item[]> {
  const item = await getItem(id);
  return item.relatedIds.flatMap((relatedId) => BY_ID.get(relatedId) ?? []);
}
