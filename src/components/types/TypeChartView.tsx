import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getEffectiveness } from '@/api/types';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { TYPE_LABELS } from '@/theme/typeNames';
import { TYPE_NAMES, type TypeName } from '@/types/pokemon';

import { SectionTitle } from '../SectionTitle';
import { TypeBadge } from '../TypeBadge';

import { TypeIcon } from './TypeIcon';

/** Lato di una casella della tabella. */
const CELL = 30;
const SIDE = 16;

type Effect = 'superEffective' | 'notVeryEffective' | 'noEffect';

/** Aspetto delle caselle diverse da ×1; `effect` dà la legenda e il testo letto dallo screen reader. */
const CELL_STYLES: Record<number, { label: string; background: string; text: string; effect: Effect }> = {
  2: { label: '2', background: colors.statUp, text: '#FFFFFF', effect: 'superEffective' },
  0.5: { label: '½', background: colors.statDown, text: '#FFFFFF', effect: 'notVeryEffective' },
  0: { label: '0', background: colors.text, text: '#FFFFFF', effect: 'noEffect' },
};

export type TypeChartViewProps = {
  onPressType: (type: TypeName) => void;
};

/**
 * Sezione Tipi: i 18 tipi da toccare per il dettaglio e la tabella 18×18 delle efficacie.
 * La tabella scorre in orizzontale, con la colonna dei tipi attaccanti sempre visibile.
 */
export function TypeChartView({ onPressType }: TypeChartViewProps) {
  const { t } = useTranslation('types');
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
          {t('chart.allTypes')}
        </Text>
        <Text style={styles.hint}>{t('chart.allTypesHint')}</Text>
        <View style={styles.typeGrid}>
          {TYPE_NAMES.map((type) => (
            <Pressable
              key={type}
              onPress={() => onPressType(type)}
              accessibilityRole="button"
              accessibilityLabel={t('typeA11y', { type: TYPE_LABELS[type] })}
              style={({ pressed }) => pressed && styles.pressed}>
              <TypeBadge type={type} size="large" />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {t('chart.title')}
        </Text>
        <Text style={styles.hint}>{t('chart.hint')}</Text>
        <View style={styles.legend}>
          {[2, 0.5, 0].map((multiplier) => {
            const cell = CELL_STYLES[multiplier];
            return (
              <View key={multiplier} style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: cell.background }]}>
                  <Text style={[styles.cellLabel, { color: cell.text }]}>{cell.label}</Text>
                </View>
                <Text style={styles.legendLabel}>{t(`chart.legend.${cell.effect}`)}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.chart}>
        <View style={styles.labels}>
          <View style={styles.corner} />
          {TYPE_NAMES.map((type) => (
            <Pressable
              key={type}
              onPress={() => onPressType(type)}
              accessibilityRole="button"
              accessibilityLabel={t('typeA11y', { type: TYPE_LABELS[type] })}
              style={({ pressed }) => pressed && styles.pressed}>
              <TypeIcon type={type} size={CELL} />
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
                  accessibilityLabel={t('typeA11y', { type: TYPE_LABELS[type] })}
                  style={({ pressed }) => pressed && styles.pressed}>
                  <TypeIcon type={type} size={CELL} />
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
                      accessibilityLabel={t('chart.cellA11y', {
                        attacker: TYPE_LABELS[attacker],
                        defender: TYPE_LABELS[defender],
                        effect: t(`chart.spoken.${cell?.effect ?? 'normal'}`),
                      })}
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
    gap: 2,
    marginRight: 2,
  },
  corner: {
    width: CELL,
    height: CELL,
  },
  grid: {
    paddingRight: SIDE,
  },
  row: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 2,
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
