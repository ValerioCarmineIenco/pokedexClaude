import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LEARN_METHOD_LABELS, LEARN_METHODS } from '@/api/learnset';
import { getMoveSummary } from '@/api/moves';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import type { LearnedMove, PokemonLearnset } from '@/types/learnset';
import type { MoveSummary } from '@/types/move';

import { ErrorState } from '../ErrorState';
import { OptionPicker, type PickerOption } from '../OptionPicker';
import { SkeletonBlock } from '../Skeleton';
import { MoveCard, ROW_MOVE_HEIGHT } from './MoveCard';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

type Props = {
  learnset: PokemonLearnset | undefined;
  isLoading: boolean;
  errorMessage: string | null;
  pokemonName: string;
  onOpenMove: (move: MoveSummary) => void;
  onRetry: () => void;
};

const countLabel = (count: number) => (count === 1 ? '1 mossa' : `${count} mosse`);

/**
 * Tab Mosse: le mosse del Pokémon nel gioco scelto, divise per metodo (livello, MT/MN, uovo,
 * insegnante). Nome, tipo, classe e potenza vengono dall'indice locale delle mosse.
 */
export function LearnedMoves({ learnset, isLoading, errorMessage, pokemonName, onOpenMove, onRetry }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View style={styles.list}>
        <SkeletonBlock width={180} height={40} radius={12} />
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonBlock key={i} width="100%" height={ROW_MOVE_HEIGHT} radius={16} />
        ))}
      </View>
    );
  }

  if (!learnset) {
    return (
      <ErrorState
        title="Mosse non disponibili"
        message={errorMessage ?? 'Non riesco a caricare le mosse. Controlla la rete e riprova.'}
        actionLabel="Riprova"
        onAction={onRetry}
      />
    );
  }

  const group =
    learnset.versionGroups.find((g) => g.slug === selected) ??
    learnset.versionGroups.find((g) => g.slug === learnset.defaultVersionGroup);

  if (!group) {
    return (
      <ErrorState title="Nessuna mossa" message={`PokéAPI non ha mosse per ${pokemonName}.`} glyph="–" />
    );
  }

  const options: PickerOption<string>[] = learnset.versionGroups.map((g) => ({
    id: g.slug,
    title: g.label,
    subtitle: `${g.generation ? `Gen ${ROMAN[g.generation - 1]} · ` : ''}${countLabel(g.moves.length)}`,
    swatch: g.color,
  }));

  return (
    <View style={styles.list}>
      <View style={styles.gameRow}>
        <Text style={styles.gameCaption}>Gioco</Text>
        <View style={styles.picker}>
          <OptionPicker
            options={options}
            value={group.slug}
            onChange={(slug) => slug && setSelected(slug)}
            label={group.label}
            accessibilityLabel={`Gioco: ${group.label}`}
            accessibilityHint="Scegli il gioco di cui vedere le mosse"
          />
        </View>
      </View>

      {LEARN_METHODS.map((method) => {
        const moves = group.moves.filter((move) => move.method === method);
        if (moves.length === 0) return null;
        return (
          <View key={method} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                {LEARN_METHOD_LABELS[method]}
              </Text>
              <Text style={styles.sectionCount}>{countLabel(moves.length)}</Text>
            </View>
            {moves.map((move) => (
              <LearnedMoveRow
                key={`${move.moveId}:${move.level}`}
                learned={move}
                showLevel={method === 'level-up'}
                onPress={onOpenMove}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
}

function LearnedMoveRow({
  learned,
  showLevel,
  onPress,
}: {
  learned: LearnedMove;
  showLevel: boolean;
  onPress: (move: MoveSummary) => void;
}) {
  const move = getMoveSummary(learned.moveId);
  if (!move) return null;
  // Livello 0 tra le mosse per livello: si impara evolvendosi (dalla Gen VII).
  const isEvolution = learned.level === 0;
  return (
    <View style={styles.row}>
      {showLevel && (
        <View
          style={styles.level}
          accessible
          accessibilityLabel={isEvolution ? 'Si impara evolvendosi' : `Livello ${learned.level}`}>
          <Text style={styles.levelCaption}>{isEvolution ? 'Evo' : 'Liv.'}</Text>
          <Text style={styles.levelValue}>{isEvolution ? '↑' : learned.level}</Text>
        </View>
      )}
      <View style={styles.card}>
        <MoveCard move={move} variant="row" onPress={onPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 18,
  },
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gameCaption: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textSubtle,
  },
  picker: {
    flexShrink: 1,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  sectionCount: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSubtle,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  level: {
    width: 44,
    height: ROW_MOVE_HEIGHT,
    borderRadius: 14,
    backgroundColor: colors.factBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelCaption: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textSubtle,
  },
  levelValue: {
    fontFamily: fonts.monoBold,
    fontSize: 16,
    color: colors.text,
  },
  card: {
    flex: 1,
    minWidth: 0,
  },
});
