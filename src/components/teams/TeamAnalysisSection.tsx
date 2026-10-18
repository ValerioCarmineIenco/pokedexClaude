import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { TYPE_NAMES_IT } from '@/theme/typeNames';
import type { TypeName } from '@/types/pokemon';
import type { TeamAnalysis } from '@/utils/teamAnalysis';

import { TypeBadge } from '../TypeBadge';

const pokemonCount = (count: number) => (count === 1 ? '1 Pokémon' : `${count} Pokémon`);

/** «Copertura di tipo»: debolezze condivise, tipi senza resistenze e tipi scoperti in attacco. */
export function TeamAnalysisSection({ analysis, size }: { analysis: TeamAnalysis; size: number }) {
  if (size === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Copertura di tipo
        </Text>
        <Text style={styles.hint}>Aggiungi dei Pokémon per vedere debolezze e tipi scoperti.</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        Copertura di tipo
      </Text>

      <View style={styles.box}>
        <Text style={styles.boxTitle}>Debolezze condivise</Text>
        {analysis.sharedWeaknesses.length > 0 ? (
          analysis.sharedWeaknesses.map((row) => (
            <View
              key={row.type}
              style={styles.weakRow}
              accessible
              accessibilityLabel={`${pokemonCount(row.weak)} deboli a ${TYPE_NAMES_IT[row.type]}`}>
              <View style={styles.weakBadge}>
                <TypeBadge type={row.type} size="large" />
              </View>
              <View style={styles.weakText}>
                <Text style={styles.weakLine}>
                  <Text style={styles.weakCount}>{pokemonCount(row.weak)}</Text> deboli a{' '}
                  {TYPE_NAMES_IT[row.type]}
                </Text>
                {row.resist > 0 && (
                  <Text style={styles.resist}>
                    {row.resist === 1 ? '1 resiste' : `${row.resist} resistono`}
                  </Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>Nessun tipo mette in difficoltà più di un Pokémon.</Text>
        )}
      </View>

      <TypeList
        title="Nessuno resiste a"
        hint="Nessun membro subisce danni ridotti da questi tipi."
        types={analysis.unresisted}
        empty="Per ogni tipo c'è almeno un Pokémon che resiste."
      />
      <TypeList
        title="Tipi scoperti"
        hint="Nessun membro li colpisce in modo superefficace con mosse del proprio tipo."
        types={analysis.uncovered}
        empty="Le mosse dei tipi della squadra colpiscono ×2 ogni tipo."
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
