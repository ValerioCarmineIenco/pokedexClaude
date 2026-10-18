import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getEffectiveness } from '@/api/types';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { TYPE_COLORS, typeTextColor } from '@/theme/typeColors';
import { TYPE_NAMES_IT } from '@/theme/typeNames';
import { TYPE_NAMES, type TypeName } from '@/types/pokemon';

import { SectionTitle } from '../SectionTitle';
import { TypeBadge } from '../TypeBadge';

/** Lato di una casella della tabella. */
const CELL = 30;
/** Larghezza della colonna con i nomi dei tipi attaccanti. */
const LABEL_WIDTH = 86;
const SIDE = 16;

/** Aspetto delle caselle diverse da ×1. */
const CELL_STYLES: Record<number, { label: string; background: string; text: string; spoken: string }> = {
  2: { label: '2', background: colors.statUp, text: '#FFFFFF', spoken: 'superefficace, per 2' },
  0.5: { label: '½', background: colors.statDown, text: '#FFFFFF', spoken: 'poco efficace, per un mezzo' },
  0: { label: '0', background: colors.text, text: '#FFFFFF', spoken: 'nessun effetto' },
};

/** Abbreviazione di tre lettere per le colonne («Fuo», «Acq»): sono tutte diverse. */
const shortName = (type: TypeName) => TYPE_NAMES_IT[type].slice(0, 3);

export type TypeChartViewProps = {
  onPressType: (type: TypeName) => void;
};

/**
 * Sezione Tipi: i 18 tipi da toccare per il dettaglio e la tabella 18×18 delle efficacie.
 * La tabella scorre in orizzontale, con la colonna dei tipi attaccanti sempre visibile.
 */
export function TypeChartView({ onPressType }: TypeChartViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <SectionTitle section="types" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Tutti i tipi
        </Text>
        <Text style={styles.hint}>Tocca un tipo per vedere efficacia, Pokémon e mosse.</Text>
        <View style={styles.typeGrid}>
          {TYPE_NAMES.map((type) => (
            <Pressable
              key={type}
              onPress={() => onPressType(type)}
              accessibilityRole="button"
              accessibilityLabel={`Tipo ${TYPE_NAMES_IT[type]}`}
              style={({ pressed }) => pressed && styles.pressed}>
              <TypeBadge type={type} size="large" />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Tabella delle efficacie
        </Text>
        <Text style={styles.hint}>
          Righe: tipo della mossa. Colonne: tipo del Pokémon colpito. Le caselle vuote sono danno normale
          (×1).
        </Text>
        <View style={styles.legend}>
          {[2, 0.5, 0].map((multiplier) => {
            const cell = CELL_STYLES[multiplier];
            return (
              <View key={multiplier} style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: cell.background }]}>
                  <Text style={[styles.cellLabel, { color: cell.text }]}>{cell.label}</Text>
                </View>
                <Text style={styles.legendLabel}>
                  {multiplier === 2 ? 'Superefficace' : multiplier === 0 ? 'Nessun effetto' : 'Poco efficace'}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.chart}>
        <View style={styles.labels}>
          <View style={styles.corner}>
            <Text style={styles.cornerLabel}>Att. ↓ Dif. →</Text>
          </View>
          {TYPE_NAMES.map((type) => (
            <Pressable
              key={type}
              onPress={() => onPressType(type)}
              accessibilityRole="button"
              accessibilityLabel={`Tipo ${TYPE_NAMES_IT[type]}`}
              style={({ pressed }) => [
                styles.rowLabel,
                { backgroundColor: TYPE_COLORS[type] },
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.rowLabelText, { color: typeTextColor(type) }]} numberOfLines={1}>
                {TYPE_NAMES_IT[type]}
              </Text>
            </Pressable>
          ))}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.grid}>
          <View>
            <View style={styles.row}>
              {TYPE_NAMES.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => onPressType(type)}
                  accessibilityRole="button"
                  accessibilityLabel={`Tipo ${TYPE_NAMES_IT[type]}`}
                  style={({ pressed }) => [
                    styles.columnLabel,
                    { backgroundColor: TYPE_COLORS[type] },
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.columnLabelText, { color: typeTextColor(type) }]}>
                    {shortName(type)}
                  </Text>
                </Pressable>
              ))}
            </View>
            {TYPE_NAMES.map((attacker) => (
              <View key={attacker} style={styles.row}>
                {TYPE_NAMES.map((defender) => {
                  const cell = CELL_STYLES[getEffectiveness(attacker, defender)];
                  return (
                    <View
                      key={defender}
                      accessible
                      accessibilityLabel={`${TYPE_NAMES_IT[attacker]} contro ${TYPE_NAMES_IT[defender]}: ${
                        cell?.spoken ?? 'danno normale'
                      }`}
                      style={[styles.cell, cell && { backgroundColor: cell.background }]}>
                      {cell && <Text style={[styles.cellLabel, { color: cell.text }]}>{cell.label}</Text>}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: SIDE,
    paddingTop: 8,
    paddingBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
  },
  section: {
    paddingHorizontal: SIDE,
    paddingTop: 12,
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textMuted,
  },
  chart: {
    flexDirection: 'row',
    marginTop: 14,
    paddingLeft: SIDE,
  },
  labels: {
    width: LABEL_WIDTH,
    gap: 2,
    marginRight: 2,
  },
  corner: {
    height: CELL + 6,
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  cornerLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.2,
    color: colors.textSubtle,
  },
  rowLabel: {
    height: CELL,
    borderRadius: 8,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  rowLabelText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  grid: {
    paddingRight: SIDE,
  },
  row: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 2,
  },
  columnLabel: {
    width: CELL,
    height: CELL + 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnLabelText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.2,
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 6,
    backgroundColor: colors.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellLabel: {
    fontFamily: fonts.monoBold,
    fontSize: 13,
  },
});
