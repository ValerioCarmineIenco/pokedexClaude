import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getArtworkUrl } from '@/api/pokemon';
import { useArtworkStyle } from '@/hooks/useArtworkStyle';
import type { MatchupType, Move, MovePokemon, MoveSummary, TypeMatchups } from '@/types/move';
import type { TypeName } from '@/types/pokemon';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { TYPE_COLORS, typeTextColor, typeTint } from '@/theme/typeColors';
import { formatName, formatNumber } from '@/utils/format';
import { romanNumeral } from '@/utils/generation';

import { ErrorState } from '../ErrorState';
import { Icon } from '../Icon';
import { PokeBallMark } from '../PokeBallMark';
import { SkeletonBlock } from '../Skeleton';
import { TypeBadge } from '../TypeBadge';

/** Parte bianca arrotondata in fondo all'intestazione, su cui poggiano i valori. */
const SHEET_CAP = 56;
/** Altezza della carta con potenza, precisione, PP e priorità. */
const STATS_HEIGHT = 92;
/** Lato delle carte quadrate dei Pokémon. */
const POKEMON_SIZE = 108;

export type MoveDetailViewProps = {
  /** Dati dell'indice locale: ci sono subito, prima della rete. */
  summary: MoveSummary | undefined;
  move: Move | undefined;
  /** Efficacia del tipo della mossa. */
  matchups: TypeMatchups | undefined;
  /** Dati in arrivo (non ancora in cache). */
  isLoading: boolean;
  errorMessage: string | null;
  /** L'id della rotta non è una mossa valida. */
  isInvalidId: boolean;
  onOpenPokemon: (id: number) => void;
  onBack: () => void;
  onRetry: () => void;
};

export function MoveDetailView({
  summary,
  move,
  matchups,
  isLoading,
  errorMessage,
  isInvalidId,
  onOpenPokemon,
  onBack,
  onRetry,
}: MoveDetailViewProps) {
  const insets = useSafeAreaInsets();
  // L'intestazione usa i dati completi se ci sono, altrimenti quelli dell'indice.
  const head = move ?? summary;

  const backButton = (
    <Pressable
      onPress={onBack}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel="Torna alle mosse"
      style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
      <Icon name="back" size={18} color={colors.text} />
    </Pressable>
  );

  if (isInvalidId || !head) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={[styles.nav, styles.navPadding]}>{backButton}</View>
        <ErrorState
          title="Mossa non trovata"
          message="Questa mossa non esiste nel Pokédex."
          actionLabel="Torna alle mosse"
          actionStyle="ghost"
          onAction={onBack}
        />
      </View>
    );
  }

  const type = head.type;
  const soft = typeTint(type, 0.14);
  const failed = !move && !isLoading;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }}
      showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { paddingTop: insets.top, backgroundColor: typeTint(type, 0.55) }]}>
        <View style={styles.nav}>{backButton}</View>
        <PokeBallMark size={210} thickness={30} style={styles.heroMark} />
        <Text style={styles.name} numberOfLines={2} accessibilityRole="header">
          {head.name}
        </Text>
        <View style={styles.badges}>
          <TypeBadge type={type} size="large" />
          <View style={[styles.badge, { backgroundColor: 'rgba(255, 255, 255, 0.65)' }]}>
            <Text style={[styles.badgeLabel, { color: colors.text }]}>{head.damageClassLabel}</Text>
          </View>
          {head.generation > 0 && (
            <View style={[styles.badge, { backgroundColor: 'rgba(255, 255, 255, 0.65)' }]}>
              <Text style={[styles.badgeLabel, { color: colors.text }]}>
                Gen {romanNumeral(head.generation)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.sheetCap} />
        <View style={styles.statsWrap}>
          <View style={[styles.stats, { borderColor: soft }]}>
            <StatCell label="Potenza" value={head.power} />
            <StatCell label="Precisione" value={head.accuracy} suffix="%" />
            <StatCell label="PP" value={head.pp} />
            <StatCell
              label="Priorità"
              value={move ? move.priority : undefined}
              format={(value) => (value > 0 ? `+${value}` : String(value))}
            />
          </View>
        </View>
      </View>

      <View style={styles.sheet}>
        {move ? (
          <Text style={styles.description}>
            {move.description || 'Nessuna descrizione in italiano disponibile.'}
          </Text>
        ) : isLoading ? (
          <View style={styles.descriptionSkeleton}>
            <SkeletonBlock width="100%" height={12} />
            <SkeletonBlock width="92%" height={12} />
            <SkeletonBlock width="60%" height={12} />
          </View>
        ) : null}

        {failed && (
          <ErrorState
            title="Nessuna connessione"
            message={errorMessage ?? 'Non riesco a raggiungere il Pokédex. Controlla la rete e riprova.'}
            actionLabel="Riprova"
            onAction={onRetry}
          />
        )}

        {move?.effect && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Effetto <Text style={styles.sectionNote}>in inglese</Text>
            </Text>
            <View style={[styles.box, { backgroundColor: soft }]}>
              <Text style={styles.effect}>{move.effect}</Text>
            </View>
          </View>
        )}

        {move && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Dettagli
            </Text>
            <View style={styles.facts}>
              {getFacts(move).map((fact, index) => (
                <View key={fact.label} style={[styles.factRow, index > 0 && styles.factDivider]}>
                  <Text style={styles.factLabel}>{fact.label}</Text>
                  <Text style={styles.factValue}>{fact.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {matchups ? (
          <DamageSection
            type={type}
            isStatus={head.damageClass === 'status'}
            matchups={matchups}
            soft={soft}
          />
        ) : isLoading ? (
          <View style={styles.section}>
            <SkeletonBlock width="40%" height={18} />
            <SkeletonBlock width="100%" height={64} radius={16} />
          </View>
        ) : null}

        {(isLoading || (move && move.pokemon.length > 0)) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Pokémon che la imparano
              {move ? <Text style={styles.sectionCount}>  {move.pokemon.length}</Text> : null}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.relatedScroll}
              contentContainerStyle={styles.relatedRow}>
              {move
                ? move.pokemon.map((pokemon) => (
                    <PokemonTile
                      key={pokemon.id}
                      pokemon={pokemon}
                      background={soft}
                      onPress={() => onOpenPokemon(pokemon.id)}
                    />
                  ))
                : Array.from({ length: 4 }, (_, i) => (
                    <SkeletonBlock key={i} width={POKEMON_SIZE} height={POKEMON_SIZE} radius={16} />
                  ))}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

/** Un valore della carta in alto. `undefined` = in arrivo, `null` = «—». */
function StatCell({
  label,
  value,
  suffix = '',
  format = String,
}: {
  label: string;
  value: number | null | undefined;
  suffix?: string;
  format?: (value: number) => string;
}) {
  const text = value == null ? '—' : `${format(value)}${suffix}`;
  return (
    <View style={styles.statCell} accessible accessibilityLabel={`${label} ${value === undefined ? '' : text}`}>
      {value === undefined ? (
        <SkeletonBlock width={34} height={22} />
      ) : (
        <Text style={styles.statValue}>{text}</Text>
      )}
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** Righe «Dettagli»: solo quelle che dicono qualcosa per questa mossa. */
function getFacts(move: Move): { label: string; value: string }[] {
  const facts = [{ label: 'Bersaglio', value: move.targetLabel }];
  if (move.ailment) {
    facts.push({
      label: 'Stato alterato',
      value: move.ailmentChance > 0 ? `${move.ailment} (${move.ailmentChance}%)` : move.ailment,
    });
  }
  if (move.statChanges.length > 0) {
    const changes = move.statChanges
      .map((change) => `${change.label} ${change.change > 0 ? '+' : ''}${change.change}`)
      .join(', ');
    facts.push({
      label: 'Statistiche',
      value: move.statChance > 0 ? `${changes} (${move.statChance}%)` : changes,
    });
  }
  if (move.flinchChance > 0) facts.push({ label: 'Tentennamento', value: `${move.flinchChance}%` });
  if (move.critRate > 0) facts.push({ label: 'Brutto colpo', value: `Probabilità alta (+${move.critRate})` });
  if (move.hits) facts.push({ label: 'Colpi', value: rangeText(move.hits) });
  if (move.turns) facts.push({ label: 'Turni', value: rangeText(move.turns) });
  if (move.drain > 0) facts.push({ label: 'Assorbe', value: `${move.drain}% del danno` });
  if (move.drain < 0) facts.push({ label: 'Contraccolpo', value: `${-move.drain}% del danno` });
  if (move.healing > 0) facts.push({ label: 'Cura', value: `${move.healing}% dei PS` });
  if (move.healing < 0) facts.push({ label: 'Perde', value: `${-move.healing}% dei PS` });
  return facts;
}

const rangeText = ({ min, max }: { min: number; max: number }) =>
  min === max ? String(min) : `Da ${min} a ${max}`;

/**
 * Efficacia del tipo della mossa: contro quali tipi fa ×2, ×½ o ×0. Le mosse di stato non
 * infliggono danni, ma le immunità le bloccano lo stesso (Tuononda non ha effetto sul tipo
 * Terra), quindi per loro resta solo «Nessun effetto».
 */
function DamageSection({
  type,
  isStatus,
  matchups,
  soft,
}: {
  type: TypeName;
  isStatus: boolean;
  matchups: TypeMatchups;
  soft: string;
}) {
  const { attack } = matchups;
  const groups = isStatus
    ? [{ key: 'none', title: 'Nessun effetto su', multiplier: '×0', types: attack.noEffect }]
    : [
        { key: 'super', title: 'Superefficace contro', multiplier: '×2', types: attack.superEffective },
        { key: 'weak', title: 'Poco efficace contro', multiplier: '×½', types: attack.notVeryEffective },
        { key: 'none', title: 'Nessun effetto su', multiplier: '×0', types: attack.noEffect },
      ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        Efficacia
      </Text>
      <Text style={styles.sectionHint}>
        {isStatus
          ? 'È una mossa di stato: non infligge danni, ma i tipi immuni la bloccano.'
          : 'Danno della mossa contro un Pokémon di ciascun tipo. Tutti gli altri tipi subiscono danno normale (×1).'}
      </Text>
      <View style={[styles.box, styles.damageBox, { backgroundColor: soft }]}>
        {groups.map((group) => (
          <MatchupRow
            key={group.key}
            title={group.title}
            multiplier={group.multiplier}
            types={group.types}
            accent={TYPE_COLORS[type]}
            accentText={typeTextColor(type)}
          />
        ))}
      </View>
    </View>
  );
}

function MatchupRow({
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

function PokemonTile({
  pokemon,
  background,
  onPress,
}: {
  pokemon: MovePokemon;
  background: string;
  onPress: () => void;
}) {
  const [artworkStyle] = useArtworkStyle();
  const name = formatName(pokemon.name);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, numero ${pokemon.id}`}
      style={({ pressed }) => [
        styles.relatedTile,
        { backgroundColor: background },
        pressed && styles.relatedPressed,
      ]}>
      <Image
        source={getArtworkUrl(pokemon.id, artworkStyle)}
        style={styles.relatedImage}
        contentFit="contain"
        transition={150}
      />
      <Text style={styles.relatedName} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.relatedNumber}>{formatNumber(pokemon.id)}</Text>
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
    paddingBottom: STATS_HEIGHT + 16,
    overflow: 'hidden',
  },
  sheetCap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_CAP,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
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
  pressed: {
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
  },
  badgeLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  statsWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 8,
  },
  stats: {
    height: STATS_HEIGHT,
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 5,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: fonts.monoBold,
    fontSize: 22,
    color: colors.text,
  },
  statLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.2,
    color: colors.textSubtle,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 22,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: '#55525C',
  },
  descriptionSkeleton: {
    gap: 10,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  sectionCount: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textSubtle,
  },
  sectionNote: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSubtle,
  },
  sectionHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: -4,
  },
  box: {
    borderRadius: 16,
    padding: 14,
  },
  effect: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  facts: {
    borderRadius: 16,
    backgroundColor: colors.factBackground,
    paddingHorizontal: 14,
  },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 11,
  },
  factDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  factLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textSubtle,
  },
  factValue: {
    flexShrink: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    textAlign: 'right',
    color: colors.text,
  },
  damageBox: {
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
  relatedScroll: {
    marginHorizontal: -20,
  },
  relatedRow: {
    paddingHorizontal: 20,
    gap: 10,
  },
  relatedTile: {
    width: POKEMON_SIZE,
    height: POKEMON_SIZE + 16,
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  relatedPressed: {
    opacity: 0.75,
  },
  relatedImage: {
    width: 64,
    height: 64,
  },
  relatedName: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
    color: colors.text,
    marginTop: 2,
  },
  relatedNumber: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
});
