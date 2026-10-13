import { StyleSheet, Text, View } from 'react-native';

import type { Nature } from '@/types/nature';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { Icon, type IconName } from '../Icon';

/** Altezza della scheda di una natura non neutra, per lo scheletro di caricamento. */
export const NATURE_CARD_HEIGHT = 132;

type Props = {
  nature: Nature;
};

function Fact({
  caption,
  value,
  icon,
  tint,
}: {
  caption: string;
  value: string;
  icon?: IconName;
  tint?: string;
}) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factCaption}>{caption}</Text>
      <View style={styles.factValueRow}>
        {icon && tint && <Icon name={icon} size={12} color={tint} />}
        <Text style={[styles.factValue, tint ? { color: tint } : null]} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/**
 * Natura dell'elenco (non si apre: le nature non hanno dettaglio). Statistica aumentata e
 * diminuita sopra, sapore preferito e non gradito sotto; le neutre lo dicono in una riga.
 */
export function NatureCard({ nature }: Props) {
  const { increasedStat, decreasedStat, likedFlavor, dislikedFlavor } = nature;
  const accessibilityLabel = nature.isNeutral
    ? `${nature.name}. Natura neutra: non cambia le statistiche e non ha sapori preferiti.`
    : `${nature.name}. Aumenta ${increasedStat?.label}, diminuisce ${decreasedStat?.label}. ` +
      `Piace il sapore ${likedFlavor?.label}, non piace il sapore ${dislikedFlavor?.label}.`;

  return (
    <View style={styles.card} accessible accessibilityLabel={accessibilityLabel}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Icon name="leaf" size={18} color={colors.accent} />
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {nature.name}
        </Text>
        {nature.isNeutral && (
          <View style={styles.neutralTag}>
            <Text style={styles.neutralTagText}>Neutra</Text>
          </View>
        )}
      </View>

      {nature.isNeutral ? (
        <Text style={styles.neutralText}>Non cambia le statistiche e non ha sapori preferiti.</Text>
      ) : (
        <View style={styles.facts}>
          <View style={styles.factRow}>
            <Fact caption="Aumenta" value={increasedStat?.label ?? '—'} icon="up" tint={colors.statUp} />
            <Fact
              caption="Diminuisce"
              value={decreasedStat?.label ?? '—'}
              icon="down"
              tint={colors.statDown}
            />
          </View>
          <View style={styles.factRow}>
            <Fact caption="Sapore preferito" value={likedFlavor?.label ?? '—'} />
            <Fact caption="Sapore non gradito" value={dislikedFlavor?.label ?? '—'} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 12,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.factBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flex: 1,
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: colors.text,
  },
  neutralTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.field,
  },
  neutralTagText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.3,
    color: colors.textMuted,
  },
  neutralText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 17,
    color: colors.textMuted,
  },
  facts: {
    gap: 8,
  },
  factRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fact: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  factCaption: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textSubtle,
  },
  factValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  factValue: {
    flexShrink: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text,
  },
});
