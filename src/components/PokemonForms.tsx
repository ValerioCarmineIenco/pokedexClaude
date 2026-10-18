import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { primaryType, TYPE_COLORS, typeTextColor, typeTint } from '@/theme/typeColors';
import type { PokemonForm, PokemonFormKind } from '@/types/pokemon';
import { STAT_LABELS } from '@/utils/format';

import { SkeletonBlock } from './Skeleton';
import { StatBar } from './StatBar';
import { TypeBadge } from './TypeBadge';

const KIND_LABELS: Record<PokemonFormKind, string> = {
  base: 'Forma base',
  mega: 'Megaevoluzione',
  regional: 'Forma regionale',
  gmax: 'Gigamax',
  special: 'Forma speciale',
};

const total = (form: PokemonForm) => form.stats.reduce((sum, stat) => sum + stat.value, 0);

export type PokemonFormsProps = {
  /** Undefined se la specie ha una sola forma (la sezione non compare) o se sta arrivando. */
  forms: PokemonForm[] | undefined;
  isLoading: boolean;
  errorMessage: string | null;
  pokemonName: string;
  onRetry: () => void;
};

/** «Forme» nella scheda: Mega, forme regionali, Gigamax e speciali, ognuna con i suoi dati. */
export function PokemonForms({ forms, isLoading, errorMessage, pokemonName, onRetry }: PokemonFormsProps) {
  // Si parte dalla prima forma alternativa: la base è già la scheda stessa.
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (!forms && !isLoading && !errorMessage) return null;

  const base = forms?.find((form) => form.isDefault);
  const selected =
    forms?.find((form) => form.id === selectedId) ?? forms?.find((form) => !form.isDefault) ?? forms?.[0];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        Forme
      </Text>
      {forms && selected ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
            style={styles.chipsScroll}
            accessibilityRole="tablist">
            {forms.map((form) => {
              const isSelected = form.id === selected.id;
              const type = primaryType(form.types);
              return (
                <Pressable
                  key={form.id}
                  onPress={() => setSelectedId(form.id)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSelected }}
                  style={({ pressed }) => [
                    styles.chip,
                    isSelected && { backgroundColor: TYPE_COLORS[type] },
                    pressed && !isSelected && styles.pressed,
                  ]}>
                  <Text style={[styles.chipLabel, isSelected && { color: typeTextColor(type) }]}>
                    {form.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <FormCard form={selected} base={base} pokemonName={pokemonName} />
        </>
      ) : errorMessage ? (
        <View style={[styles.card, styles.error]}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable
            onPress={onRetry}
            hitSlop={6}
            accessibilityRole="button"
            style={({ pressed }) => [styles.retry, pressed && styles.pressedRetry]}>
            <Text style={styles.retryLabel}>Riprova</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.skeleton}>
          <SkeletonBlock width="70%" height={34} radius={999} />
          <SkeletonBlock width="100%" height={220} radius={16} />
        </View>
      )}
    </View>
  );
}

function FormCard({
  form,
  base,
  pokemonName,
}: {
  form: PokemonForm;
  base: PokemonForm | undefined;
  pokemonName: string;
}) {
  const type = primaryType(form.types);
  const formTotal = total(form);
  const difference = base && !form.isDefault ? formTotal - total(base) : 0;
  const kindLabel = KIND_LABELS[form.kind];

  return (
    <View style={[styles.card, { backgroundColor: typeTint(type, 0.14) }]}>
      <View style={styles.header}>
        <Image
          source={form.artworkUrl}
          style={styles.artwork}
          contentFit="contain"
          transition={200}
          accessibilityLabel={`Artwork di ${pokemonName}, ${form.label}`}
        />
        <View style={styles.headerText}>
          <Text style={styles.formName} numberOfLines={2}>
            {form.label}
          </Text>
          {kindLabel !== form.label && <Text style={styles.kind}>{kindLabel}</Text>}
          <View style={styles.types}>
            {form.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Abilità</Text>
        <View style={styles.abilities}>
          {form.abilities.map((ability) => (
            <View key={ability.name} style={styles.ability}>
              <Text style={styles.abilityName}>{ability.label}</Text>
              {ability.isHidden && <Text style={styles.abilityHidden}>Nascosta</Text>}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Statistiche base</Text>
        <View style={styles.stats}>
          {form.stats.map((stat) => (
            <StatBar
              key={stat.name}
              label={STAT_LABELS[stat.name]}
              value={stat.value}
              color={TYPE_COLORS[type]}
            />
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Totale</Text>
            <Text style={styles.totalValue}>{formTotal}</Text>
            {difference !== 0 && (
              <Text style={[styles.difference, { color: difference > 0 ? colors.statUp : colors.statDown }]}>
                {difference > 0 ? `+${difference}` : `−${-difference}`} rispetto alla forma base
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  // Le chip scorrono fino al bordo dello schermo, oltre il margine del foglio.
  chipsScroll: {
    marginHorizontal: -20,
  },
  chips: {
    gap: 8,
    paddingHorizontal: 20,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.factBackground,
  },
  chipLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.text,
  },
  pressed: {
    backgroundColor: colors.field,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  artwork: {
    width: 104,
    height: 104,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  formName: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    letterSpacing: -0.4,
    color: colors.text,
  },
  kind: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textSubtle,
  },
  types: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  block: {
    gap: 8,
  },
  blockTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textSubtle,
  },
  abilities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  abilityName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text,
  },
  abilityHidden: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textSubtle,
  },
  stats: {
    gap: 6,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  totalLabel: {
    width: 72,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.text,
  },
  totalValue: {
    width: 32,
    textAlign: 'right',
    fontFamily: fonts.monoBold,
    fontSize: 13,
    color: colors.text,
  },
  difference: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  skeleton: {
    gap: 10,
  },
  error: {
    backgroundColor: colors.factBackground,
    gap: 10,
    alignItems: 'flex-start',
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  retry: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colors.text,
  },
  pressedRetry: {
    opacity: 0.75,
  },
  retryLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.surface,
  },
});
