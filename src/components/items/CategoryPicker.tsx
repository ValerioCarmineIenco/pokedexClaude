import { getItemIndex } from '@/api/items';
import { CATEGORY_COLORS } from '@/theme/categoryColors';
import { ITEM_CATEGORIES, ITEM_CATEGORY_LABELS, type ItemCategory } from '@/types/item';

import { OptionPicker, type PickerOption } from '../OptionPicker';

type Props = {
  /** null = tutte le categorie. */
  value: ItemCategory | null;
  onChange: (category: ItemCategory | null) => void;
};

const countLabel = (n: number) => `${n} ${n === 1 ? 'oggetto' : 'oggetti'}`;

const OPTIONS: PickerOption<ItemCategory>[] = [
  { id: null, title: 'Tutte le categorie', subtitle: countLabel(getItemIndex().length) },
  ...ITEM_CATEGORIES.map((category) => ({
    id: category,
    title: ITEM_CATEGORY_LABELS[category],
    subtitle: countLabel(getItemIndex(category).length),
    swatch: CATEGORY_COLORS[category],
  })),
];

/** Pulsante nella barra in alto che apre il menu delle categorie di oggetti. */
export function CategoryPicker({ value, onChange }: Props) {
  const label = value ? ITEM_CATEGORY_LABELS[value] : 'Tutte';
  return (
    <OptionPicker
      options={OPTIONS}
      value={value}
      onChange={onChange}
      label={label}
      accessibilityLabel={`Categoria: ${value ? label : 'tutte'}`}
      accessibilityHint="Apre la scelta della categoria"
    />
  );
}
