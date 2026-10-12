import { FIRST_POKEMON_ID, GENERATIONS, LAST_POKEMON_ID } from '@/api/generations';
import { formatNumber } from '@/utils/format';
import { shortGenerationLabel } from '@/utils/generation';

import { OptionPicker, type PickerOption } from './OptionPicker';

type Props = {
  /** null = tutte le generazioni. */
  value: number | null;
  onChange: (generationId: number | null) => void;
};

const OPTIONS: PickerOption<number>[] = [
  {
    id: null,
    title: 'Tutte le generazioni',
    subtitle: `${formatNumber(FIRST_POKEMON_ID)}–${formatNumber(LAST_POKEMON_ID)}`,
  },
  ...GENERATIONS.map((g) => ({
    id: g.id,
    title: g.name,
    subtitle: `${g.region} · ${formatNumber(g.firstId)}–${formatNumber(g.lastId)}`,
  })),
];

/** Pulsante nella barra in alto che apre il menu delle generazioni. */
export function GenerationPicker({ value, onChange }: Props) {
  const selected = GENERATIONS.find((g) => g.id === value);
  return (
    <OptionPicker
      options={OPTIONS}
      value={value}
      onChange={onChange}
      label={selected ? shortGenerationLabel(selected) : 'Tutte'}
      accessibilityLabel={`Generazione: ${selected ? selected.name : 'tutte'}`}
      accessibilityHint="Apre la scelta della generazione"
    />
  );
}
