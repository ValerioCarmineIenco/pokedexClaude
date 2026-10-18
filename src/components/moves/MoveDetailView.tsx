import { Image } from 'expo-image';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getArtworkUrl } from '@/api/pokemon';
import { useArtworkStyle } from '@/hooks/useArtworkStyle';
import { getLanguage } from '@/i18n';
import { pokemonName } from '@/i18n/names';
import type { Move, MovePokemon, MoveSummary, TypeMatchups } from '@/types/move';
import type { TypeName } from '@/types/pokemon';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { TYPE_COLORS, typeTextColor, typeTint } from '@/theme/typeColors';
import { formatNumber } from '@/utils/format';
import { romanNumeral } from '@/utils/generation';

import { ErrorState } from '../ErrorState';
import { Icon } from '../Icon';
import { MatchupRow } from '../MatchupRow';
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
  const { t } = useTranslation('moves');
  const insets = useSafeAreaInsets();
  // L'intestazione usa i dati completi se ci sono, altrimenti quelli dell'indice.
  const head = move ?? summary;

  const backButton = (
    <Pressable
      onPress={onBack}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={t('detail.back')}
      style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
      <Icon name="back" size={18} color={colors.text} />
    </Pressable>
  );

  if (isInvalidId || !head) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={[styles.nav, styles.navPadding]}>{backButton}</View>
        <ErrorState
          title={t('detail.notFoundTitle')}
          message={t('detail.notFoundMessage')}
          actionLabel={t('detail.back')}
          actionStyle="ghost"
          onAction={onBack}
        />
      </View>
    );
  }

  const type = head.type;
  const soft = typeTint(type, 0.14);
  const failed = !move && !isLoading;
  // «in inglese» solo se l'effetto è il ripiego inglese: PokéAPI ha poche altre lingue.
  const effectIsFallback = move?.effectLanguage === 'en' && getLanguage() !== 'en';

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
                {t('generation', { numeral: romanNumeral(head.generation), number: head.generation })}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.sheetCap} />
        <View style={styles.statsWrap}>
          <View style={[styles.stats, { borderColor: soft }]}>
            <StatCell label={t('detail.power')} value={head.power} />
            <StatCell label={t('detail.accuracy')} value={head.accuracy} suffix="%" />
            <StatCell label={t('detail.pp')} value={head.pp} />
            <StatCell
              label={t('detail.priority')}
              value={move ? move.priority : undefined}
              format={(value) => (value > 0 ? `+${value}` : String(value))}
            />
          </View>
        </View>
      </View>

      <View style={styles.sheet}>
        {move ? (
          <Text style={styles.description}>
            {move.description || t('detail.noDescription')}
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
            title={t('detail.offlineTitle')}
            message={errorMessage ?? t('detail.offlineMessage')}
            actionLabel={t('detail.retry')}
            onAction={onRetry}
          />
        )}

        {move?.effect && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              {t('detail.effect')}
              {effectIsFallback ? <Text style={styles.sectionNote}> {t('detail.effectInEnglish')}</Text> : null}
            </Text>
            <View style={[styles.box, { backgroundColor: soft }]}>
              <Text style={styles.effect}>{move.effect}</Text>
            </View>
          </View>
        )}

        {move && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              {t('detail.details')}
            </Text>
            <View style={styles.facts}>
              {getFacts(move, t).map((fact, index) => (
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
              {t('detail.learnedBy')}
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
function getFacts(move: Move, t: TFunction<'moves'>): { label: string; value: string }[] {
  const withChance = (value: string, chance: number) =>
    chance > 0 ? t('facts.withChance', { value, chance }) : value;
  const rangeText = ({ min, max }: { min: number; max: number }) =>
    min === max ? String(min) : t('facts.range', { min, max });

  const facts = [{ label: t('facts.target'), value: move.targetLabel }];
  if (move.ailment) {
    facts.push({ label: t('facts.ailment'), value: withChance(move.ailment, move.ailmentChance) });
  }
  if (move.statChanges.length > 0) {
    const changes = move.statChanges
      .map((change) => `${change.label} ${change.change > 0 ? '+' : ''}${change.change}`)
      .join(', ');
    facts.push({ label: t('facts.stats'), value: withChance(changes, move.statChance) });
  }
  if (move.flinchChance > 0) facts.push({ label: t('facts.flinch'), value: `${move.flinchChance}%` });
  if (move.critRate > 0) facts.push({ label: t('facts.crit'), value: t('facts.critValue', { rate: move.critRate }) });
  if (move.hits) facts.push({ label: t('facts.hits'), value: rangeText(move.hits) });
  if (move.turns) facts.push({ label: t('facts.turns'), value: rangeText(move.turns) });
  if (move.drain > 0) facts.push({ label: t('facts.drain'), value: t('facts.drainValue', { percent: move.drain }) });
  if (move.drain < 0) facts.push({ label: t('facts.recoil'), value: t('facts.drainValue', { percent: -move.drain }) });
  if (move.healing > 0) {
    facts.push({ label: t('facts.healing'), value: t('facts.healingValue', { percent: move.healing }) });
  }
  if (move.healing < 0) {
    facts.push({ label: t('facts.loses'), value: t('facts.healingValue', { percent: -move.healing }) });
  }
  return facts;
}

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
  const { t } = useTranslation(['moves', 'types']);
  const { attack } = matchups;
  const none = { key: 'none', title: t('types:matchups.noEffect'), multiplier: '×0', types: attack.noEffect };
  const groups = isStatus
    ? [none]
    : [
        { key: 'super', title: t('types:matchups.superEffective'), multiplier: '×2', types: attack.superEffective },
        { key: 'weak', title: t('types:matchups.notVeryEffective'), multiplier: '×½', types: attack.notVeryEffective },
        none,
      ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {t('damage.title')}
      </Text>
      <Text style={styles.sectionHint}>{isStatus ? t('damage.statusHint') : t('damage.hint')}</Text>
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

function PokemonTile({
  pokemon,
  background,
  onPress,
}: {
  pokemon: MovePokemon;
  background: string;
  onPress: () => void;
}) {
  const { t } = useTranslation('moves');
  const [artworkStyle] = useArtworkStyle();
  const name = pokemonName(pokemon.id, pokemon.name);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('detail.pokemonA11y', { name, number: pokemon.id })}
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
