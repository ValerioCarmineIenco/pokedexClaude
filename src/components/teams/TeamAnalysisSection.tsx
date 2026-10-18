import { Trans, useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { TYPE_LABELS } from '@/theme/typeNames';
import type { TypeName } from '@/types/pokemon';
import type { TeamAnalysis } from '@/utils/teamAnalysis';

import { TypeBadge } from '../TypeBadge';

/** «Copertura di tipo»: debolezze condivise, tipi senza resistenze e tipi scoperti in attacco. */
export function TeamAnalysisSection({ analysis, size }: { analysis: TeamAnalysis; size: number }) {
  const { t } = useTranslation('teams');
  if (size === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {t('analysis.title')}
        </Text>
        <Text style={styles.hint}>{t('analysis.emptyHint')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {t('analysis.title')}
      </Text>

      <View style={styles.box}>
        <Text style={styles.boxTitle}>{t('analysis.sharedTitle')}</Text>
        {analysis.sharedWeaknesses.length > 0 ? (
          analysis.sharedWeaknesses.map((row) => (
            <View
              key={row.type}
              style={styles.weakRow}
              accessible
              accessibilityLabel={t('analysis.weakA11y', { count: row.weak, type: TYPE_LABELS[row.type] })}>
              <View style={styles.weakBadge}>
                <TypeBadge type={row.type} size="large" />
              </View>
              <View style={styles.weakText}>
                <Text style={styles.weakLine}>
                  <Trans
                    t={t}
                    i18nKey="analysis.weakLine"
                    count={row.weak}
                    values={{ type: TYPE_LABELS[row.type] }}
                    components={{ bold: <Text style={styles.weakCount} /> }}
                  />
                </Text>
                {row.resist > 0 && (
                  <Text style={styles.resist}>{t('analysis.resist', { count: row.resist })}</Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>{t('analysis.sharedEmpty')}</Text>
        )}
      </View>

      <TypeList
        title={t('analysis.unresistedTitle')}
        hint={t('analysis.unresistedHint')}
        types={analysis.unresisted}
        empty={t('analysis.unresistedEmpty')}
      />
      <TypeList
        title={t('analysis.uncoveredTitle')}
        hint={t('analysis.uncoveredHint')}
        types={analysis.uncovered}
        empty={t('analysis.uncoveredEmpty')}
      />
    </View>
  );
}

function TypeList({
  title,
  hint,
  types,
  empty,
}: {
  title: string;
  hint: string;
  types: TypeName[];
  empty: string;
}) {
  return (
    <View style={styles.box}>
      <Text style={styles.boxTitle}>{title}</Text>
      <Text style={styles.boxHint}>{hint}</Text>
      {types.length > 0 ? (
        <View style={styles.types}>
          {types.map((type) => (
            <TypeBadge key={type} type={type} size="large" />
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>{empty}</Text>
      )}
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
  },
  box: {
    borderRadius: 16,
    padding: 14,
    gap: 10,
    backgroundColor: colors.factBackground,
  },
  boxTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  boxHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
    marginTop: -6,
  },
  weakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weakBadge: {
    width: 84,
  },
  weakText: {
    flex: 1,
  },
  weakLine: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
  },
  weakCount: {
    fontFamily: fonts.bodyBold,
    color: colors.statDown,
  },
  resist: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
});
