import { FlashList } from '@shopify/flash-list';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getMovesOfType, getPokemonOfType, getStaticTypeMatchups } from '@/api/types';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { TYPE_COLORS, typeTextColor, typeTint } from '@/theme/typeColors';
import { TYPE_NAMES_IT } from '@/theme/typeNames';
import type { MatchupType, MoveSummary } from '@/types/move';
import type { PokemonSummary, TypeName } from '@/types/pokemon';

import { ErrorState } from '../ErrorState';
import { Icon } from '../Icon';
import { MoveCard } from '../moves/MoveCard';
import { PokeBallMark } from '../PokeBallMark';
import { PokemonCard } from '../PokemonCard';
import { TypeBadge } from '../TypeBadge';

type Tab = 'pokemon' | 'moves';

type Row = { kind: 'pokemon'; pokemon: PokemonSummary } | { kind: 'move'; move: MoveSummary };

export type TypeDetailViewProps = {
  /** null se l'id della rotta non è un tipo. */
  type: TypeName | null;
  onOpenPokemon: (id: number) => void;
  onOpenMove: (id: number) => void;
  onOpenType: (type: TypeName) => void;
  onBack: () => void;
};

/**
 * Dettaglio di un tipo: efficacia in attacco e in difesa, poi l'elenco dei Pokémon o delle
 * mosse di quel tipo. Tutto dagli indici locali, quindi funziona anche offline.
 */
export function TypeDetailView({ type, onOpenPokemon, onOpenMove, onOpenType, onBack }: TypeDetailViewProps) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('pokemon');

  const data = useMemo(() => {
    if (!type) return null;
    return {
      matchups: getStaticTypeMatchups(type),
      pokemon: getPokemonOfType(type),
      moves: getMovesOfType(type),
    };
  }, [type]);

  const backButton = (
    <Pressable
      onPress={onBack}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel="Torna ai tipi"
      style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}>
      <Icon name="back" size={18} color={colors.text} />
    </Pressable>
  );

  if (!type || !data) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={[styles.nav, styles.navPadding]}>{backButton}</View>
        <ErrorState
          title="Tipo non trovato"
          message="Questo tipo non esiste nel Pokédex."
          actionLabel="Torna ai tipi"
          actionStyle="ghost"
          onAction={onBack}
        />
      </View>
    );
  }

  const { matchups, pokemon, moves } = data;
  const soft = typeTint(type, 0.14);
  const accent = { background: TYPE_COLORS[type], text: typeTextColor(type) };
  const rows: Row[] =
    tab === 'pokemon'
      ? pokemon.map((entry) => ({ kind: 'pokemon', pokemon: entry }))
      : moves.map((move) => ({ kind: 'move', move }));

  const header = (
    <View>
      <View style={[styles.hero, { paddingTop: insets.top, backgroundColor: typeTint(type, 0.55) }]}>
        <View style={styles.nav}>{backButton}</View>
        <PokeBallMark size={210} thickness={30} style={styles.heroMark} />
        <Text style={styles.name} accessibilityRole="header">
          {TYPE_NAMES_IT[type]}
        </Text>
        <View style={styles.badges}>
          <TypeBadge type={type} size="large" />
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>{pokemon.length} Pokémon</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>{moves.length} mosse</Text>
          </View>
        </View>
      </View>

      <View style={styles.sheet}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            In attacco
          </Text>
          <Text style={styles.hint}>Danno delle mosse {TYPE_NAMES_IT[type]} contro ciascun tipo.</Text>
          <View style={[styles.box, { backgroundColor: soft }]}>
            <Matchups
              title="Superefficace contro"
              multiplier="×2"
              types={matchups.attack.superEffective}
              accent={accent}
              onOpenType={onOpenType}
            />
            <Matchups
              title="Poco efficace contro"
              multiplier="×½"
              types={matchups.attack.notVeryEffective}
              accent={accent}
              onOpenType={onOpenType}
            />
            <Matchups
              title="Nessun effetto su"
              multiplier="×0"
              types={matchups.attack.noEffect}
              accent={accent}
              onOpenType={onOpenType}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            In difesa
          </Text>
          <Text style={styles.hint}>Danno subito da un Pokémon di solo tipo {TYPE_NAMES_IT[type]}.</Text>
          <View style={[styles.box, { backgroundColor: soft }]}>
            <Matchups
              title="Debole a"
              multiplier="×2"
              types={matchups.defense.weakTo}
              accent={accent}
              onOpenType={onOpenType}
            />
            <Matchups
              title="Resistente a"
              multiplier="×½"
              types={matchups.defense.resists}
              accent={accent}
              onOpenType={onOpenType}
            />
            <Matchups
              title="Immune a"
              multiplier="×0"
              types={matchups.defense.immuneTo}
              accent={accent}
              onOpenType={onOpenType}
            />
          </View>
        </View>

        <View style={styles.tabs} accessibilityRole="tablist">
          <TabButton
            label={`Pokémon  ${pokemon.length}`}
            selected={tab === 'pokemon'}
            onPress={() => setTab('pokemon')}
          />
          <TabButton
            label={`Mosse  ${moves.length}`}
            selected={tab === 'moves'}
            onPress={() => setTab('moves')}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlashList
        key={tab}
        data={rows}
        ListHeaderComponent={header}
        keyExtractor={(row) => (row.kind === 'pokemon' ? `p${row.pokemon.id}` : `m${row.move.id}`)}
        getItemType={(row) => row.kind}
        renderItem={({ item: row }) => (
          <View style={styles.rowCell}>
            {row.kind === 'pokemon' ? (
              <PokemonCard pokemon={row.pokemon} variant="row" onPress={(entry) => onOpenPokemon(entry.id)} />
            ) : (
              <MoveCard move={row.move} variant="row" onPress={(move) => onOpenMove(move.id)} />
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {tab === 'pokemon' ? 'Nessun Pokémon di questo tipo.' : 'Nessuna mossa di questo tipo.'}
          </Text>
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

/** Una riga di efficacia con i tipi tappabili: aprono il loro dettaglio. */
function Matchups({
  title,
  multiplier,
  types,
  accent,
  onOpenType,
}: {
  title: string;
  multiplier: string;
  types: MatchupType[];
  accent: { background: string; text: string };
  onOpenType: (type: TypeName) => void;
}) {
  return (
    <View style={styles.matchupRow}>
      <View style={styles.matchupHead}>
        <View style={[styles.multiplier, { backgroundColor: accent.background }]}>
          <Text style={[styles.multiplierLabel, { color: accent.text }]}>{multiplier}</Text>
        </View>
        <Text style={styles.matchupTitle}>{title}</Text>
      </View>
      {types.length > 0 ? (
        <View style={styles.matchupTypes}>
          {types.map((matchup) => (
            <Pressable
              key={matchup.type}
              onPress={() => onOpenType(matchup.type)}
              accessibilityRole="button"
              accessibilityLabel={`Tipo ${matchup.label}`}
              style={({ pressed }) => pressed && styles.pressed}>
              <TypeBadge type={matchup.type} size="large" />
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={styles.matchupEmpty}>Nessun tipo</Text>
      )}
    </View>
  );
}

function TabButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.tab, selected && styles.tabSelected, pressed && styles.pressed]}>
      <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  navPadding: {
    paddingHorizontal: 16,
  },
  hero: {
    paddingHorizontal: 16,
    paddingBottom: 44,
    overflow: 'hidden',
  },
  heroMark: {
    right: -50,
    top: 40,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  name: {
    fontFamily: fonts.displayBold,
    fontSize: 34,
    letterSpacing: -0.8,
    color: colors.text,
    marginTop: 4,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  badgeLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.2,
    color: colors.text,
  },
  sheet: {
    marginTop: -26,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: colors.surface,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 22,
  },
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
  pressed: {
    opacity: 0.7,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 3,
    backgroundColor: colors.field,
  },
  tab: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabSelected: {
    backgroundColor: colors.surface,
  },
  tabLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  tabLabelSelected: {
    color: colors.text,
  },
  rowCell: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
