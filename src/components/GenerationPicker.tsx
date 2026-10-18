import { useTranslation } from 'react-i18next';

import { FIRST_POKEMON_ID, GENERATIONS, LAST_POKEMON_ID } from '@/api/generations';
import { formatNumber } from '@/utils/format';
import { shortGenerationLabel } from '@/utils/generation';

import { OptionPicker, type PickerOption } from './OptionPicker';

type Props = {
  /** null = tutte le generazioni. */
  value: number | null;
  onChange: (generationId: number | null) => void;
};

/** Pulsante nella barra in alto che apre il menu delle generazioni. */
export function GenerationPicker({ value, onChange }: Props) {
  const { t } = useTranslation('pokedex');
  // Costruite al render: nomi e regioni seguono la lingua in uso.
  const options: PickerOption<number>[] = [
    {
      id: null,
      title: t('generation.allGenerations'),
      subtitle: `${formatNumber(FIRST_POKEMON_ID)}–${formatNumber(LAST_POKEMON_ID)}`,
    },
    ...GENERATIONS.map((g) => ({
      id: g.id,
      title: g.name,
      subtitle: `${g.region} · ${formatNumber(g.firstId)}–${formatNumber(g.lastId)}`,
    })),
  ];
  const selected = GENERATIONS.find((g) => g.id === value);
  return (
    <OptionPicker
      options={options}
      value={value}
      onChange={onChange}
      label={selected ? shortGenerationLabel(selected) : t('common.all')}
      accessibilityLabel={
        selected ? t('generation.pickerLabel', { name: selected.name }) : t('generation.pickerLabelAll')
      }
      accessibilityHint={t('generation.pickerHint')}
    />
  );
}
