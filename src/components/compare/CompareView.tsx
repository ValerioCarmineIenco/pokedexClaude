import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getArtworkUrl } from '@/api/pokemon';
import { useArtworkStyle } from '@/hooks/useArtworkStyle';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { primaryType, TYPE_COLORS, typeTint } from '@/theme/typeColors';
import { TYPE_NAMES, type Pokemon, type TypeName } from '@/types/pokemon';
import { formatName, formatNumber, STAT_LABELS } from '@/utils/format';
import { type DefenseGroup, type DefenseMultiplier, formatMultiplier } from '@/utils/typeEffectiveness';

import { ErrorState } from '../ErrorState';
import { Icon } from '../Icon';
import { SkeletonBlock } from '../Skeleton';
import { StatBar } from '../StatBar';
import { TypeBadge } from '../TypeBadge';

/** Uno dei due lati del confronto. */
export type CompareSide = {
  pokemon: Pokemon | undefined;
  isLoading: boolean;
  errorMessage: string | null;
  /** Debolezze e resistenze, calcolate sui tipi del Pokémon. */
  defense: DefenseGroup[] | undefined;
  isDefenseLoading: boolean;
  defenseErrorMessage: string | null;
};

export type CompareViewProps = {
  first: CompareSide;
  second: CompareSide;
  onBack: () => void;
  onRetry: () => void;
  /** Sceglie un altro Pokémon al posto del primo (0) o del secondo (1). */
  onChange: (side: 0 | 1) => void;
  onOpenPokemon: (id: number) => void;
};

/** Due Pokémon a confronto: tipi, statistiche base con la differenza, abilità e resistenze. */
export function CompareView({ first, second, onBack, onRetry, onChange, onOpenPokemon }: CompareViewProps) {
  const insets = useSafeAreaInsets();
  const sides = [first, second] as const;
  const a = first.pokemon;
  const b = second.pokemon;
  const failed = sides.find((side) => !side.pokemon && !side.isLoading);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top, paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}>
      <View style={styles.nav}>
        <Pressable
          onPress={onBack}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Indietro"
          style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}>
          <Icon name="back" size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle} accessibilityRole="header">
          Confronto
        </Text>
      </View>

      {failed ? (
        <ErrorState
          title="Nessuna connessione"
          message={failed.errorMessage ?? 'Non riesco a raggiungere il Pokédex. Controlla la rete e riprova.'}
          actionLabel="Riprova"
          onAction={onRetry}
        />
      ) : (
        <View style={styles.body}>
          <View style={styles.columns}>
            {sides.map((side, index) => (
              <PokemonColumn
                key={index}
                pokemon={side.pokemon}
                onOpen={onOpenPokemon}
                onChange={() => onChange(index as 0 | 1)}
              />
            ))}
          </View>

          {a && b ? (
            <>
              <Section title="Statistiche base">
                <StatsComparison first={a} second={b} />
              </Section>
              <Section title="Abilità">
                <View style={styles.columns}>
                  {[a, b].map((pokemon, index) => (
                    <View key={index} style={styles.abilities}>
                      {pokemon.abilities.map((ability) => (
                        <View key={ability.name} style={styles.ability}>
                          <Text style={styles.abilityName}>{formatName(ability.name)}</Text>
                          {ability.isHidden && <Text style={styles.abilityHidden}>Nascosta</Text>}
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </Section>
              <Section title="Efficacia dei tipi">
                <Text style={styles.hint}>
                  Danno subito dalle mosse di ciascun tipo. Sono elencati solo i tipi che non fanno danno
                  normale (×1) a entrambi; in verde il Pokémon che subisce meno.
                </Text>
                {first.defense && second.defense ? (
                  <DefenseComparison first={a} second={b} firstGroups={first.defense} secondGroups={second.defense} />
                ) : first.isDefenseLoading || second.isDefenseLoading ? (
                  <SkeletonBlock width="100%" height={240} radius={16} />
                ) : (
                  <Text style={styles.hint}>
                    {first.defenseErrorMessage ?? second.defenseErrorMessage ?? 'Efficacia non disponibile.'}
                  </Text>
                )}
              </Section>
            </>
          ) : (
            <View style={styles.skeleton}>
              {Array.from({ length: 7 }, (_, i) => (
                <SkeletonBlock key={i} width="100%" height={10} />
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function PokemonColumn({
  pokemon,
  onOpen,
  onChange,
}: {
  pokemon: Pokemon | undefined;
  onOpen: (id: number) => void;
  onChange: () => void;
}) {
  const [artworkStyle] = useArtworkStyle();
  if (!pokemon) {
    return (
      <View style={[styles.column, { backgroundColor: colors.skeleton }]}>
        <SkeletonBlock width={96} height={96} radius={48} />
        <SkeletonBlock width="70%" height={16} />
      </View>
    );
  }
  const name = formatName(pokemon.name);
  return (
    <View style={[styles.column, { backgroundColor: typeTint(primaryType(pokemon.types), 0.32) }]}>
      <Pressable
        onPress={() => onOpen(pokemon.id)}
        accessibilityRole="button"
        accessibilityLabel={`Apri la scheda di ${name}`}
        style={({ pressed }) => [styles.columnMain, pressed && styles.columnPressed]}>
        <Image
          source={getArtworkUrl(pokemon.id, artworkStyle)}
          style={styles.artwork}
          contentFit="contain"
          transition={150}
          accessibilityLabel={`Artwork di ${name}`}
        />
        <Text style={styles.number}>{formatNumber(pokemon.id)}</Text>
        <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
          {name}
        </Text>
        <View style={styles.types}>
          {pokemon.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </View>
      </Pressable>
      <Pressable
        onPress={onChange}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`Scegli un altro Pokémon al posto di ${name}`}
        style={({ pressed }) => [styles.change, pressed && styles.pressed]}>
        <Text style={styles.changeLabel}>Cambia</Text>
      </Pressable>
    </View>
  );
}

function StatsComparison({ first, second }: { first: Pokemon; second: Pokemon }) {
  const total = (pokemon: Pokemon) => pokemon.stats.reduce((sum, stat) => sum + stat.value, 0);
  const rows = first.stats.map((stat) => ({
    key: stat.name,
    label: STAT_LABELS[stat.name],
    a: stat.value,
    b: second.stats.find((other) => other.name === stat.name)?.value ?? 0,
  }));
  const colorA = TYPE_COLORS[primaryType(first.types)];
  const colorB = TYPE_COLORS[primaryType(second.types)];
  // Con lo stesso tipo principale le barre sarebbero identiche: la seconda diventa grigia.
  const secondColor = colorA === colorB ? colors.textSubtle : colorB;

  return (
    <View style={styles.stats}>
      {rows.map((row) => (
        <View key={row.key} style={styles.statBlock}>
          <StatHead label={row.label} a={row.a} b={row.b} first={first} second={second} />
          <StatBar label={formatName(first.name)} value={row.a} color={colorA} />
          <StatBar label={formatName(second.name)} value={row.b} color={secondColor} />
        </View>
      ))}
      <View style={[styles.statBlock, styles.totalBlock]}>
        <StatHead label="Totale" a={total(first)} b={total(second)} first={first} second={second} showValues />
      </View>
    </View>
  );
}

/** Nome della statistica e chi è più alto, di quanto. */
function StatHead({
  label,
  a,
  b,
  first,
  second,
  showValues = false,
}: {
  label: string;
  a: number;
  b: number;
  first: Pokemon;
  second: Pokemon;
  showValues?: boolean;
}) {
  const diff = a - b;
  const leader = diff > 0 ? first : second;
  return (
    <View style={styles.statHead}>
      <Text style={styles.statLabel}>
        {label}
        {showValues && <Text style={styles.totalValues}>{`  ${a} – ${b}`}</Text>}
      </Text>
      {diff === 0 ? (
        <Text style={[styles.diff, styles.diffEven]}>Pari</Text>
      ) : (
        <Text style={styles.diff} numberOfLines={1}>
          {formatName(leader.name)} <Text style={styles.diffValue}>+{Math.abs(diff)}</Text>
        </Text>
      )}
    </View>
  );
}

function multipliersOf(groups: DefenseGroup[]): Record<TypeName, number> {
  const result = Object.fromEntries(TYPE_NAMES.map((type) => [type, 1])) as Record<TypeName, number>;
  for (const group of groups) for (const { type } of group.types) result[type] = group.multiplier;
  return result;
}

const formatAny = (multiplier: number) =>
  multiplier === 1 ? '×1' : formatMultiplier(multiplier as DefenseMultiplier);

function DefenseComparison({
  first,
  second,
  firstGroups,
  secondGroups,
}: {
  first: Pokemon;
  second: Pokemon;
  firstGroups: DefenseGroup[];
  secondGroups: DefenseGroup[];
}) {
  const a = multipliersOf(firstGroups);
  const b = multipliersOf(secondGroups);
  const types = TYPE_NAMES.filter((type) => a[type] !== 1 || b[type] !== 1);
  const count = (values: Record<TypeName, number>, test: (m: number) => boolean) =>
    TYPE_NAMES.filter((type) => test(values[type])).length;

  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableType, styles.tableHeadText]}>Tipo</Text>
        <Text style={[styles.tableCell, styles.tableHeadText]} numberOfLines={1}>
          {formatName(first.name)}
        </Text>
        <Text style={[styles.tableCell, styles.tableHeadText]} numberOfLines={1}>
          {formatName(second.name)}
        </Text>
      </View>
      {types.map((type) => (
        <View key={type} style={styles.tableRow}>
          <View style={styles.tableType}>
            <TypeBadge type={type} />
          </View>
          <MultiplierCell value={a[type]} other={b[type]} />
          <MultiplierCell value={b[type]} other={a[type]} />
        </View>
      ))}
      <View style={[styles.tableRow, styles.tableFooter]}>
        <Text style={[styles.tableType, styles.tableHeadText]}>Debolezze</Text>
        <Text style={[styles.tableCell, styles.summary]}>{count(a, (m) => m > 1)}</Text>
        <Text style={[styles.tableCell, styles.summary]}>{count(b, (m) => m > 1)}</Text>
      </View>
      <View style={styles.tableRow}>
        <Text style={[styles.tableType, styles.tableHeadText]}>Resistenze</Text>
        <Text style={[styles.tableCell, styles.summary]}>{count(a, (m) => m < 1)}</Text>
        <Text style={[styles.tableCell, styles.summary]}>{count(b, (m) => m < 1)}</Text>
      </View>
    </View>
  );
}

function MultiplierCell({ value, other }: { value: number; other: number }) {
  const better = value < other;
  const worse = value > other;
  return (
    <View style={styles.tableCell}>
      <View style={[styles.multiplier, better && styles.better, worse && styles.worse]}>
        <Text
          style={[
            styles.multiplierText,
            value === 1 && styles.multiplierNeutral,
            better && styles.betterText,
            worse && styles.worseText,
          ]}>
          {formatAny(value)}
        </Text>
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 52,
    paddingHorizontal: 12,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.text,
  },
  pressed: {
    backgroundColor: 'rgba(29, 28, 34, 0.08)',
  },
  body: {
    paddingHorizontal: 16,
    gap: 22,
  },
  columns: {
    flexDirection: 'row',
    gap: 10,
  },
  column: {
    flex: 1,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    minHeight: 200,
    justifyContent: 'center',
  },
  columnMain: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 14,
    gap: 2,
  },
  columnPressed: {
    opacity: 0.8,
  },
  artwork: {
    width: 96,
    height: 96,
  },
  number: {
    fontFamily: fonts.monoBold,
    fontSize: 12,
    color: 'rgba(29, 28, 34, 0.6)',
  },
  name: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.text,
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
  },
  change: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  changeLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.text,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: -4,
  },
  skeleton: {
    gap: 10,
  },
  stats: {
    gap: 14,
  },
  statBlock: {
    gap: 2,
  },
  totalBlock: {
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  statHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  totalValues: {
    fontFamily: fonts.monoBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  diff: {
    flexShrink: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  diffEven: {
    color: colors.textSubtle,
  },
  diffValue: {
    fontFamily: fonts.monoBold,
    color: colors.statUp,
  },
  abilities: {
    flex: 1,
    gap: 6,
    alignItems: 'flex-start',
  },
  ability: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 6,
    backgroundColor: colors.factBackground,
    borderRadius: 14,
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
  table: {
    borderRadius: 16,
    backgroundColor: colors.factBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
  },
  tableHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  tableFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    marginTop: 4,
  },
  tableType: {
    flex: 1.1,
    alignItems: 'flex-start',
  },
  tableCell: {
    flex: 1,
    alignItems: 'center',
    textAlign: 'center',
  },
  tableHeadText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textMuted,
  },
  summary: {
    fontFamily: fonts.monoBold,
    fontSize: 13,
    color: colors.text,
  },
  multiplier: {
    minWidth: 44,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: 'center',
  },
  better: {
    backgroundColor: 'rgba(47, 158, 98, 0.14)',
  },
  worse: {
    backgroundColor: 'rgba(214, 64, 43, 0.12)',
  },
  multiplierText: {
    fontFamily: fonts.monoBold,
    fontSize: 13,
    color: colors.text,
  },
  multiplierNeutral: {
    color: colors.textSubtle,
  },
  betterText: {
    color: colors.statUp,
  },
  worseText: {
    color: colors.statDown,
  },
});
