import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ViewMode } from '@/hooks/useViewMode';
import { t } from '@/i18n';
import { fonts } from '@/theme/fonts';
import { typeTint } from '@/theme/typeColors';
import { TYPE_LABELS } from '@/theme/typeNames';
import type { MoveSummary } from '@/types/move';

import { PokeBallMark } from '../PokeBallMark';
import { TypeBadge } from '../TypeBadge';

export const ROW_MOVE_HEIGHT = 72;
export const GRID_MOVE_HEIGHT = 124;

type Props = {
  move: MoveSummary;
  variant: ViewMode;
  onPress: (move: MoveSummary) => void;
};

const formatPower = (power: number | null) => (power === null ? '—' : String(power));
const formatAccuracy = (accuracy: number | null) => (accuracy === null ? '—' : `${accuracy}%`);

export function accessibilityLabelFor(move: MoveSummary): string {
  const power =
    move.power === null ? t('moves:card.a11yNoPower') : t('moves:card.a11yPower', { power: move.power });
  const accuracy =
    move.accuracy === null
      ? t('moves:card.a11yNeverMisses')
      : t('moves:card.a11yAccuracy', { accuracy: move.accuracy });
  return t('moves:card.a11yLabel', {
    name: move.name,
    type: TYPE_LABELS[move.type],
    damageClass: move.damageClassLabel,
    power,
    accuracy,
    pp: move.pp,
  });
}

function Stat({ caption, value, compact }: { caption: string; value: string; compact: boolean }) {
  return (
    <View style={[styles.stat, compact ? styles.statCompact : styles.statFill]}>
      <Text style={styles.statCaption}>{caption}</Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

/**
 * `compact` (riga): caselle a larghezza fissa, così su iOS/Android non si allargano fino a
 * schiacciare nome e tipo. In griglia si dividono la larghezza della scheda.
 */
function Stats({ move, compact = false }: { move: MoveSummary; compact?: boolean }) {
  const { t } = useTranslation('moves');
  return (
    <View style={[styles.stats, compact && styles.statsCompact]}>
      <Stat caption={t('card.power')} value={formatPower(move.power)} compact={compact} />
      <Stat caption={t('card.accuracy')} value={formatAccuracy(move.accuracy)} compact={compact} />
      <Stat caption={t('card.pp')} value={String(move.pp)} compact={compact} />
    </View>
  );
}

/**
 * Mossa dell'elenco, con lo sfondo del colore del suo tipo. Griglia: nome, tipo e classe
 * sopra, potenza, precisione e PP sotto. Riga: nome e tipo a sinistra, i tre valori a destra.
 */
export function MoveCard({ move, variant, onPress }: Props) {
  const isGrid = variant === 'grid';

  return (
    <Pressable
      onPress={() => onPress(move)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabelFor(move)}
      style={({ pressed }) => [
        isGrid ? styles.grid : styles.row,
        { backgroundColor: typeTint(move.type) },
        pressed && styles.pressed,
      ]}>
      {isGrid ? (
        <>
          <PokeBallMark size={104} thickness={14} style={styles.gridMark} />
          <View style={styles.gridTop}>
            <Text style={styles.name} numberOfLines={1}>
              {move.name}
            </Text>
            <View style={styles.typeRow}>
              <TypeBadge type={move.type} />
              <Text style={styles.damageClass} numberOfLines={1}>
                {move.damageClassLabel}
              </Text>
            </View>
          </View>
          <Stats move={move} />
        </>
      ) : (
        <>
          <PokeBallMark size={88} thickness={12} style={styles.rowMark} />
          <View style={styles.rowText}>
            <Text style={styles.name} numberOfLines={1}>
              {move.name}
            </Text>
            <View style={styles.typeRow}>
              <TypeBadge type={move.type} />
              <Text style={styles.damageClass} numberOfLines={1}>
                {move.damageClassLabel}
              </Text>
            </View>
          </View>
          <Stats move={move} compact />
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    height: GRID_MOVE_HEIGHT,
    borderRadius: 16,
    padding: 12,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  row: {
    height: ROW_MOVE_HEIGHT,
    borderRadius: 16,
    paddingHorizontal: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  gridMark: {
    right: -24,
    top: -24,
  },
  rowMark: {
    right: -20,
    top: -16,
  },
  gridTop: {
    gap: 6,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: '#1D1C22',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  damageClass: {
    flexShrink: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.2,
    color: 'rgba(29, 28, 34, 0.6)',
  },
  stats: {
    flexDirection: 'row',
    gap: 6,
  },
  statsCompact: {
    flexShrink: 0,
    gap: 4,
  },
  stat: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
  },
  statFill: {
    flex: 1,
  },
  statCompact: {
    width: 46,
  },
  statCaption: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: 'rgba(29, 28, 34, 0.55)',
  },
  statValue: {
    fontFamily: fonts.monoBold,
    fontSize: 13,
    color: '#1D1C22',
  },
});
