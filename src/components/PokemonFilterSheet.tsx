import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GENERATIONS } from '@/api/generations';
import { colors, radius } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { TYPE_COLORS, typeTextColor } from '@/theme/typeColors';
import { labelMap, t } from '@/i18n';
import { TYPE_LABELS } from '@/theme/typeNames';
import {
  DEFAULT_POKEMON_FILTERS,
  TYPE_NAMES,
  type PokemonCategory,
  type PokemonFilters,
  type PokemonSort,
  type StatName,
  type TypeName,
} from '@/types/pokemon';
import { STAT_LABELS } from '@/utils/format';
import { shortGenerationLabel } from '@/utils/generation';

import { Icon } from './Icon';

// Etichette lette nella lingua in uso a ogni accesso.
export const CATEGORY_LABELS: Record<PokemonCategory, string> = labelMap(
  ['legendary', 'mythical', 'baby'],
  (category) => t(`pokedex:filters.categories.${category}`),
);

export const SORT_LABELS: Record<PokemonSort, string> = labelMap(
  ['number', 'name', ...(Object.keys(STAT_LABELS) as StatName[]), 'total'],
  (sort) =>
    sort === 'number' || sort === 'name' || sort === 'total'
      ? t(`pokedex:filters.sort.${sort}`)
      : STAT_LABELS[sort],
);

/** Quanti filtri sono attivi, per il pallino sul pulsante (la generazione ha il suo selettore). */
export function countActiveFilters(filters: PokemonFilters): number {
  return (
    filters.types.length +
    (filters.category ? 1 : 0) +
    (filters.sort !== 'number' || filters.reversed ? 1 : 0)
  );
}

type Props = {
  visible: boolean;
  onClose: () => void;
  filters: PokemonFilters;
  onFiltersChange: (filters: PokemonFilters) => void;
  /** null = tutte le generazioni. */
  generationId: number | null;
  onGenerationChange: (generationId: number | null) => void;
  /** Pokémon che passano i filtri, per il pulsante di chiusura. */
  resultCount: number;
};

/** Pannello dal basso con tipi, generazione, categoria e ordinamento. Ogni scelta si applica subito. */
export function PokemonFilterSheet({
  visible,
  onClose,
  filters,
  onFiltersChange,
  generationId,
  onGenerationChange,
  resultCount,
}: Props) {
  const { t } = useTranslation('pokedex');
  const insets = useSafeAreaInsets();
  const update = (patch: Partial<PokemonFilters>) => onFiltersChange({ ...filters, ...patch });

  // Al massimo due tipi: il terzo prende il posto del secondo.
  const toggleType = (type: TypeName) => {
    const { types } = filters;
    if (types.includes(type)) update({ types: types.filter((t) => t !== type) });
    else update({ types: types.length < 2 ? [...types, type] : [types[0], type] });
  };
  const isDefault = countActiveFilters(filters) === 0 && generationId == null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('filters.close')} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.grabber} />
        <View style={styles.titleRow}>
          <Text style={styles.title} accessibilityRole="header">
            {t('filters.title')}
          </Text>
          <Pressable
            onPress={() => {
              onFiltersChange(DEFAULT_POKEMON_FILTERS);
              onGenerationChange(null);
            }}
            disabled={isDefault}
            hitSlop={8}
            accessibilityRole="button"
            style={({ pressed }) => [pressed && styles.pressed, isDefault && styles.disabled]}>
            <Text style={styles.reset}>{t('filters.reset')}</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Section
            title={t('filters.types')}
            hint={filters.types.length === 2 ? t('filters.bothTypes') : t('filters.upToTwoTypes')}>
            {TYPE_NAMES.map((type) => {
              const selected = filters.types.includes(type);
              return (
                <Chip
                  key={type}
                  label={TYPE_LABELS[type]}
                  selected={selected}
                  onPress={() => toggleType(type)}
                  color={TYPE_COLORS[type]}
                  textColor={typeTextColor(type)}
                />
              );
            })}
          </Section>

          <Section title={t('filters.generation')}>
            <Chip
              label={t('filters.allGenerations')}
              selected={generationId == null}
              onPress={() => onGenerationChange(null)}
            />
            {GENERATIONS.map((g) => (
              <Chip
                key={g.id}
                label={shortGenerationLabel(g)}
                selected={generationId === g.id}
                onPress={() => onGenerationChange(g.id)}
              />
            ))}
          </Section>

          <Section title={t('filters.category')}>
            <Chip
              label={t('filters.allCategories')}
              selected={filters.category == null}
              onPress={() => update({ category: null })}
            />
            {(Object.keys(CATEGORY_LABELS) as PokemonCategory[]).map((category) => (
              <Chip
                key={category}
                label={CATEGORY_LABELS[category]}
                selected={filters.category === category}
                onPress={() => update({ category: filters.category === category ? null : category })}
              />
            ))}
          </Section>

          <Section title={t('filters.sortBy')}>
            {(Object.keys(SORT_LABELS) as PokemonSort[]).map((sort) => (
              <Chip
                key={sort}
                label={SORT_LABELS[sort]}
                selected={filters.sort === sort}
                onPress={() => update({ sort, reversed: false })}
              />
            ))}
            <Pressable
              onPress={() => update({ reversed: !filters.reversed })}
              accessibilityRole="switch"
              accessibilityLabel={t('filters.reverseOrder')}
              accessibilityState={{ checked: filters.reversed }}
              style={({ pressed }) => [styles.chip, styles.direction, pressed && styles.pressed]}>
              <Icon name={directionIcon(filters)} size={13} color={colors.text} />
              <Text style={styles.chipLabel}>{directionLabel(filters)}</Text>
            </Pressable>
          </Section>
        </ScrollView>

        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          style={({ pressed }) => [styles.done, pressed && styles.pressed]}>
          <Text style={styles.doneLabel}>
            {resultCount === 0 ? t('filters.noPokemon') : t('filters.show', { count: resultCount })}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

/** Le statistiche partono dalla più alta, numero e nome dal più basso. */
function isDescending({ sort, reversed }: PokemonFilters): boolean {
  const statSort = sort !== 'number' && sort !== 'name';
  return statSort !== reversed;
}

function directionIcon(filters: PokemonFilters) {
  return isDescending(filters) ? 'down' : 'up';
}

function directionLabel(filters: PokemonFilters): string {
  const descending = isDescending(filters);
  if (filters.sort === 'name') return t(descending ? 'pokedex:filters.nameDescending' : 'pokedex:filters.nameAscending');
  return t(descending ? 'pokedex:filters.descending' : 'pokedex:filters.ascending');
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {title}
        </Text>
        {hint && <Text style={styles.sectionHint}>{hint}</Text>}
      </View>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
  color,
  textColor,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Colore pieno quando è selezionato (es. il colore del tipo); predefinito l'accento. */
  color?: string;
  textColor?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => [
        styles.chip,
        selected && { backgroundColor: color ?? colors.accent },
        pressed && styles.pressed,
      ]}>
      {color && !selected && <View style={[styles.swatch, { backgroundColor: color }]} />}
      <Text style={[styles.chipLabel, selected && { color: textColor ?? colors.surface }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(29, 28, 34, 0.28)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '88%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingTop: 8,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.line,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.text,
  },
  reset: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.accent,
  },
  disabled: {
    opacity: 0.35,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 18,
  },
  section: {
    gap: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  sectionHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSubtle,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.field,
  },
  direction: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  swatch: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.text,
  },
  pressed: {
    opacity: 0.7,
  },
  done: {
    marginHorizontal: 20,
    marginTop: 4,
    height: 48,
    borderRadius: radius.field,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.surface,
  },
});
