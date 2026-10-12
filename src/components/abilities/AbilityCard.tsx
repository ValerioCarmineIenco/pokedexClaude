import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ViewMode } from '@/hooks/useViewMode';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { Icon } from '../Icon';

export const ROW_ABILITY_HEIGHT = 84;
export const GRID_ABILITY_HEIGHT = 140;

/** Dati di un'abilità che servono all'elenco. */
export type AbilityListEntry = {
  id: number;
  /** Nome italiano (es. «Statico»), altrimenti inglese. */
  name: string;
  /** Effetto in breve; stringa vuota se assente. */
  description: string;
};

type Props = {
  ability: AbilityListEntry;
  variant: ViewMode;
  onPress: (ability: AbilityListEntry) => void;
};

function Badge({ size }: { size: number }) {
  return (
    <View style={[styles.badge, { width: size, height: size }]}>
      <Icon name="sparkles" size={Math.round(size * 0.45)} color={colors.accent} />
    </View>
  );
}

/** Abilità dell'elenco. Griglia: scheda con nome ed effetto. Riga: icona, nome ed effetto. */
export function AbilityCard({ ability, variant, onPress }: Props) {
  const isGrid = variant === 'grid';

  return (
    <Pressable
      onPress={() => onPress(ability)}
      accessibilityRole="button"
      accessibilityLabel={ability.description ? `${ability.name}. ${ability.description}` : ability.name}
      style={({ pressed }) => [isGrid ? styles.grid : styles.row, pressed && styles.pressed]}>
      {isGrid ? (
        <>
          <Badge size={32} />
          <Text style={styles.gridName} numberOfLines={1}>
            {ability.name}
          </Text>
          {!!ability.description && (
            <Text style={styles.description} numberOfLines={3}>
              {ability.description}
            </Text>
          )}
        </>
      ) : (
        <>
          <Badge size={44} />
          <View style={styles.rowText}>
            <Text style={styles.rowName} numberOfLines={1}>
              {ability.name}
            </Text>
            {!!ability.description && (
              <Text style={styles.description} numberOfLines={2}>
                {ability.description}
              </Text>
            )}
          </View>
          <Icon name="next" size={16} color={colors.textSubtle} />
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    height: GRID_ABILITY_HEIGHT,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 12,
    gap: 6,
  },
  row: {
    height: ROW_ABILITY_HEIGHT,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  badge: {
    borderRadius: 12,
    backgroundColor: colors.factBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridName: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: colors.text,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowName: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.text,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 17,
    color: colors.textMuted,
  },
});
