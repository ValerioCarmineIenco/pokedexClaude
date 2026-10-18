import { useTranslation } from 'react-i18next';

import { getItemIndex } from '@/api/items';
import { CATEGORY_COLORS } from '@/theme/categoryColors';
import { ITEM_CATEGORIES, ITEM_CATEGORY_LABELS, type ItemCategory } from '@/types/item';

import { OptionPicker, type PickerOption } from '../OptionPicker';

type Props = {
  /** null = tutte le categorie. */
  value: ItemCategory | null;
  onChange: (category: ItemCategory | null) => void;
};

/** Pulsante nella barra in alto che apre il menu delle categorie di oggetti. */
export function CategoryPicker({ value, onChange }: Props) {
  const { t } = useTranslation('items');
  const countLabel = (count: number) => t('list.count', { count });

  // Costruite al render: le etichette seguono la lingua in uso.
  const options: PickerOption<ItemCategory>[] = [
    { id: null, title: t('picker.allCategories'), subtitle: countLabel(getItemIndex().length) },
    ...ITEM_CATEGORIES.map((category) => ({
      id: category,
      title: ITEM_CATEGORY_LABELS[category],
      subtitle: countLabel(getItemIndex(category).length),
      swatch: CATEGORY_COLORS[category],
    })),
  ];

  const label = value ? ITEM_CATEGORY_LABELS[value] : t('picker.all');
  return (
    <OptionPicker
      options={options}
      value={value}
      onChange={onChange}
      label={label}
      accessibilityLabel={value ? t('picker.label', { category: label }) : t('picker.labelAll')}
      accessibilityHint={t('picker.hint')}
    />
  );
}
