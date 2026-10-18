import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import type { MatchupType } from '@/types/move';

import { TypeBadge } from './TypeBadge';

/** Una riga di efficacia: moltiplicatore, titolo e i tipi interessati. */
export function MatchupRow({
  title,
  multiplier,
  types,
  accent,
  accentText,
}: {
  title: string;
  multiplier: string;
  types: MatchupType[];
  accent: string;
  accentText: string;
}) {
  return (
    <View style={styles.matchupRow}>
      <View style={styles.matchupHead}>
        <View style={[styles.multiplier, { backgroundColor: accent }]}>
          <Text style={[styles.multiplierLabel, { color: accentText }]}>{multiplier}</Text>
        </View>
        <Text style={styles.matchupTitle}>{title}</Text>
      </View>
      {types.length > 0 ? (
        <View style={styles.matchupTypes}>
          {types.map((matchup) => (
            <TypeBadge key={matchup.type} type={matchup.type} size="large" />
          ))}
        </View>
      ) : (
        <Text style={styles.matchupEmpty}>Nessun tipo</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  matchupRow: {
    gap: 8,
  },
  matchupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  multiplier: {
    minWidth: 34,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
  },
  multiplierLabel: {
    fontFamily: fonts.monoBold,
    fontSize: 13,
  },
  matchupTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  matchupTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  matchupEmpty: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
});
