import { StyleSheet, View } from 'react-native';

import type { Palette } from '@/theme/themes';
import { TYPE_COLORS } from '@/theme/typeColors';

/** Mescola `hex` con la base del tema come fa `tintColor`, ma con una tavolozza qualsiasi. */
function mix(hex: string, palette: Palette, amount: number) {
  const base = parseInt(palette.tintBase.slice(1), 16);
  const n = parseInt(hex.slice(1), 16);
  const share = Math.min(1, amount * palette.tintStrength);
  const c = (a: number, b: number) => Math.round(a * share + b * (1 - share));
  return `rgb(${c(n >> 16, base >> 16)}, ${c((n >> 8) & 255, (base >> 8) & 255)}, ${c(n & 255, base & 255)})`;
}

const CARD_TYPES = ['grass', 'fire', 'water', 'electric'] as const;

/**
 * Elenco Pokédex in miniatura, disegnato con i colori di un tema: si vede com'è prima di
 * sceglierlo. Usa la tavolozza passata, non quella attiva.
 */
export function ThemePreview({ palette }: { palette: Palette }) {
  return (
    <View style={[styles.frame, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <View style={[styles.ball, { borderColor: palette.text, backgroundColor: palette.surface }]}>
          <View style={[styles.ballTop, { backgroundColor: palette.accent }]} />
        </View>
        <View style={[styles.title, { backgroundColor: palette.text }]} />
        <View style={[styles.pill, { backgroundColor: palette.accent }]} />
      </View>
      <View style={[styles.search, { backgroundColor: palette.field }]}>
        <View style={[styles.searchText, { backgroundColor: palette.textSubtle }]} />
      </View>
      <View style={styles.grid}>
        {CARD_TYPES.map((type) => (
          <View key={type} style={[styles.card, { backgroundColor: mix(TYPE_COLORS[type], palette, 0.28) }]}>
            <View style={[styles.cardDot, { backgroundColor: TYPE_COLORS[type] }]} />
            <View style={[styles.cardLine, { backgroundColor: palette.text }]} />
            <View style={[styles.cardLineShort, { backgroundColor: palette.textMuted }]} />
          </View>
        ))}
      </View>
      <View style={[styles.bar, { backgroundColor: palette.surface, borderTopColor: palette.line }]}>
        <View style={[styles.barDot, { backgroundColor: palette.accent }]} />
        <View style={[styles.barDot, { backgroundColor: palette.textSubtle }]} />
        <View style={[styles.barDot, { backgroundColor: palette.textSubtle }]} />
      </View>
    </View>
  );
}

// Colori tutti dalla tavolozza passata: qui niente `themedStyles`.
const styles = StyleSheet.create({
  frame: {
    borderRadius: 12,
    padding: 8,
    paddingBottom: 0,
    gap: 6,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ball: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  ballTop: {
    height: '50%',
  },
  title: {
    width: 44,
    height: 7,
    borderRadius: 3.5,
  },
  pill: {
    marginLeft: 'auto',
    width: 18,
    height: 9,
    borderRadius: 4.5,
  },
  search: {
    height: 14,
    borderRadius: 5,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  searchText: {
    width: '40%',
    height: 4,
    borderRadius: 2,
    opacity: 0.6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  card: {
    width: '45%',
    flexGrow: 1,
    height: 38,
    borderRadius: 7,
    padding: 5,
    gap: 3,
  },
  cardDot: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    opacity: 0.85,
  },
  cardLine: {
    width: '55%',
    height: 4,
    borderRadius: 2,
  },
  cardLineShort: {
    width: '30%',
    height: 3,
    borderRadius: 1.5,
    opacity: 0.7,
  },
  bar: {
    marginHorizontal: -8,
    height: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  barDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
