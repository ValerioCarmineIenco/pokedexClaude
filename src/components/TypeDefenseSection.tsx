import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { TYPE_COLORS, typeTextColor, typeTint } from '@/theme/typeColors';
import type { TypeName } from '@/types/pokemon';
import { type DefenseGroup, type DefenseMultiplier, formatMultiplier } from '@/utils/typeEffectiveness';

import { MatchupRow } from './MatchupRow';
import { SkeletonBlock } from './Skeleton';

/** Chiave del titolo di ciascuna riga (`typeDefense.rows.*`). */
const TITLES = {
  4: 'quadruple',
  2: 'double',
  0.5: 'half',
  0.25: 'quarter',
  0: 'immune',
} as const satisfies Record<DefenseMultiplier, string>;

/** ×4 e ×¼ esistono solo con due tipi: le righe compaiono solo se contengono qualcosa. */
const OPTIONAL = new Set<DefenseMultiplier>([4, 0.25]);

export type TypeDefenseSectionProps = {
  /** Tipo principale del Pokémon: dà il colore alla sezione. */
  type: TypeName;
  groups: DefenseGroup[] | undefined;
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
};

/** «Efficacia dei tipi» nella scheda: quanto danno subisce il Pokémon da ciascun tipo. */
export function TypeDefenseSection({ type, groups, isLoading, errorMessage, onRetry }: TypeDefenseSectionProps) {
  const { t } = useTranslation('pokemon');
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {t('typeDefense.title')}
      </Text>
      <Text style={styles.hint}>{t('typeDefense.hint')}</Text>
      {groups ? (
        <View style={[styles.box, { backgroundColor: typeTint(type, 0.14) }]}>
          {groups
            .filter((group) => group.types.length > 0 || !OPTIONAL.has(group.multiplier))
            .map((group) => (
              <MatchupRow
                key={group.multiplier}
                title={t(`typeDefense.rows.${TITLES[group.multiplier]}`)}
                multiplier={formatMultiplier(group.multiplier)}
                types={group.types}
                accent={TYPE_COLORS[type]}
                accentText={typeTextColor(type)}
              />
            ))}
        </View>
      ) : isLoading ? (
        <SkeletonBlock width="100%" height={120} radius={16} />
      ) : errorMessage ? (
        <View style={[styles.box, styles.error]}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable
            onPress={onRetry}
            hitSlop={6}
            accessibilityRole="button"
            style={({ pressed }) => [styles.retry, pressed && styles.pressed]}>
            <Text style={styles.retryLabel}>{t('detail.retry')}</Text>
          </Pressable>
        </View>
      ) : null}
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
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: -4,
  },
  box: {
    borderRadius: 16,
    padding: 14,
    gap: 16,
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
  pressed: {
    opacity: 0.75,
  },
  retryLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.surface,
  },
});
