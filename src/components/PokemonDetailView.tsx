import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GENERATIONS, LAST_POKEMON_ID } from '@/api/generations';
import { getAbilityIndexEntryByName } from '@/api/abilities';
import { getArtworkUrl, getShinyArtworkUrl } from '@/api/pokemon';
import { useArtworkStyle } from '@/hooks/useArtworkStyle';
import { t as translate } from '@/i18n';
import { localName, pokemonName } from '@/i18n/names';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { primaryType, TYPE_COLORS, typeTint } from '@/theme/typeColors';
import type { EvolutionChain as Chain } from '@/types/evolution';
import type { PokemonLearnset } from '@/types/learnset';
import type { PokemonEncounterGroup } from '@/types/location';
import type { MoveSummary } from '@/types/move';
import type { PokemonArtworks, PokemonDetail, PokemonForm } from '@/types/pokemon';
import type { DefenseGroup } from '@/utils/typeEffectiveness';
import {
  formatHeight,
  formatName,
  formatNumber,
  formatWeight,
  STAT_LABELS,
} from '@/utils/format';

import { ArtworkGallery } from './ArtworkGallery';
import { DetailTabs, type DetailTab } from './DetailTabs';
import { ErrorState } from './ErrorState';
import { EvolutionChain } from './EvolutionChain';
import { Icon, type IconName } from './Icon';
import { LearnedMoves } from './moves/LearnedMoves';
import { PokeBallMark } from './PokeBallMark';
import { PokemonEncounters } from './PokemonEncounters';
import { PokemonForms } from './PokemonForms';
import { ShinyControls } from './ShinyControls';
import { SkeletonBlock } from './Skeleton';
import { StatBar } from './StatBar';
import { TypeBadge } from './TypeBadge';
import { TypeDefenseSection } from './TypeDefenseSection';
import { TypeIcon } from './types/TypeIcon';

const ARTWORK_SIZE = 180;
/** Parte bianca arrotondata in fondo all'intestazione, su cui poggia l'artwork. */
const SHEET_CAP = 72;
/** Altezza della barra dei pulsanti, uguale nell'intestazione grande e in quella compatta. */
const NAV_HEIGHT = 52;

/** «Questo Pokédex contiene solo i 1025 Pokémon di Kanto, …, e Paldea», nella lingua in uso. */
function invalidIdMessage(): string {
  const regions = GENERATIONS.map((g) => g.region);
  const list =
    regions.length > 1
      ? translate('pokemon:detail.regionList', {
          list: regions.slice(0, -1).join(translate('pokemon:detail.listSeparator')),
          last: regions.at(-1),
        })
      : regions[0];
  return translate('pokemon:detail.invalidId', { total: LAST_POKEMON_ID, regions: list });
}

export type PokemonDetailViewProps = {
  pokemon: PokemonDetail | undefined;
  /** Dati principali in arrivo (non ancora in cache). */
  isLoading: boolean;
  /** La descrizione sta ancora arrivando. */
  isDescriptionLoading: boolean;
  errorMessage: string | null;
  /** L'id della rotta non è un Pokémon delle generazioni coperte. */
  isInvalidId: boolean;
  previousId: number | null;
  nextId: number | null;
  onNavigate: (id: number) => void;
  /** Il Pokémon è tra i preferiti. */
  isFavorite: boolean;
  onToggleFavorite: () => void;
  /** Lo shiny di questo Pokémon è stato ottenuto. */
  isShinyCaught: boolean;
  onToggleShinyCaught: () => void;
  /** Apre il confronto con un altro Pokémon. */
  onCompare: () => void;
  onBack: () => void;
  onRetry: () => void;
  tab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  artworks: PokemonArtworks | undefined;
  /** La galleria della tab Artwork sta arrivando. */
  isArtworksLoading: boolean;
  artworksErrorMessage: string | null;
  onArtworksRetry: () => void;
  evolutionChain: Chain | undefined;
  /** La catena della tab Evoluzioni sta arrivando. */
  isEvolutionsLoading: boolean;
  evolutionsErrorMessage: string | null;
  onEvolutionsRetry: () => void;
  /** Apre un altro Pokémon della catena. */
  onOpenEvolution: (id: number) => void;
  onOpenItem: (id: number) => void;
  onOpenLocation: (id: number) => void;
  onOpenAbility: (id: number) => void;
  learnset: PokemonLearnset | undefined;
  /** Le mosse della tab Mosse stanno arrivando. */
  isLearnsetLoading: boolean;
  learnsetErrorMessage: string | null;
  onLearnsetRetry: () => void;
  onOpenMove: (move: MoveSummary) => void;
  /** Debolezze e resistenze, calcolate sui tipi del Pokémon. */
  typeDefense: DefenseGroup[] | undefined;
  isTypeDefenseLoading: boolean;
  typeDefenseErrorMessage: string | null;
  onTypeDefenseRetry: () => void;
  /** Forme alternative della specie; undefined se ne ha una sola. */
  forms: PokemonForm[] | undefined;
  isFormsLoading: boolean;
  formsErrorMessage: string | null;
  onFormsRetry: () => void;
  /** «Dove trovarlo»: località per gioco; vuoto se non si incontra in natura. */
  encounters: PokemonEncounterGroup[] | undefined;
  isEncountersLoading: boolean;
  encountersErrorMessage: string | null;
  onEncountersRetry: () => void;
};

export function PokemonDetailView({
  pokemon,
  isLoading,
  isDescriptionLoading,
  errorMessage,
  isInvalidId,
  previousId,
  nextId,
  onNavigate,
  isFavorite,
  onToggleFavorite,
  isShinyCaught,
  onToggleShinyCaught,
  onCompare,
  onBack,
  onRetry,
  tab,
  onTabChange,
  artworks,
  isArtworksLoading,
  artworksErrorMessage,
  onArtworksRetry,
  evolutionChain,
  isEvolutionsLoading,
  evolutionsErrorMessage,
  onEvolutionsRetry,
  onOpenEvolution,
  onOpenItem,
  onOpenLocation,
  onOpenAbility,
  learnset,
  isLearnsetLoading,
  learnsetErrorMessage,
  onLearnsetRetry,
  onOpenMove,
  typeDefense,
  isTypeDefenseLoading,
  typeDefenseErrorMessage,
  onTypeDefenseRetry,
  forms,
  isFormsLoading,
  formsErrorMessage,
  onFormsRetry,
  encounters,
  isEncountersLoading,
  encountersErrorMessage,
  onEncountersRetry,
}: PokemonDetailViewProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('pokemon');
  const [artworkStyle] = useArtworkStyle();
  // «Mostra shiny» cambia solo l'artwork in alto, non lo stile scelto nelle Impostazioni.
  const [showShiny, setShowShiny] = useState(false);
  const type = pokemon ? primaryType(pokemon.types) : null;
  const heroColor = type ? typeTint(type, 0.42) : colors.skeleton;

  // Scorrimento della scheda: sopra `collapseAt` (nome e tipi finiti sotto la barra)
  // l'intestazione grande è sparita e compare quella compatta, fissa in alto.
  const scrollY = useSharedValue(0);
  const collapseAt = useSharedValue(100);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const heroFade = useAnimatedStyle(() => {
    const progress = interpolate(scrollY.value, [0, collapseAt.value], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: 1 - progress,
      transform: [{ translateY: progress * 12 }, { scale: 1 - progress * 0.04 }],
    };
  });

  // Nome della specie nella lingua in uso (la scheda è sempre di una specie, id ≤ 1025).
  const name = pokemon ? pokemonName(pokemon.id, pokemon.name) : '';
  const backButton = <NavButton icon="back" label={t('detail.back')} onPress={onBack} />;
  const nav = (
    <View style={styles.nav}>
      {backButton}
      <View style={styles.navSide}>
        {pokemon && (
          <NavButton
            icon={isFavorite ? 'heart' : 'heartOutline'}
            label={isFavorite ? t('detail.removeFavorite') : t('detail.addFavorite')}
            color={isFavorite ? colors.accent : undefined}
            onPress={onToggleFavorite}
          />
        )}
        <NavButton
          icon="previous"
          label={previousId ? t('detail.previous', { number: formatNumber(previousId) }) : t('detail.noPrevious')}
          text={previousId ? formatNumber(previousId) : undefined}
          onPress={previousId ? () => onNavigate(previousId) : undefined}
        />
        <NavButton
          icon="next"
          iconAfter
          label={nextId ? t('detail.next', { number: formatNumber(nextId) }) : t('detail.noNext')}
          text={nextId ? formatNumber(nextId) : undefined}
          onPress={nextId ? () => onNavigate(nextId) : undefined}
        />
      </View>
    </View>
  );

  if (isInvalidId || (!pokemon && !isLoading)) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={[styles.nav, styles.navPadding]}>{backButton}</View>
        {isInvalidId ? (
          <ErrorState
            title={t('detail.notFoundTitle')}
            message={invalidIdMessage()}
            actionLabel={t('detail.back')}
            actionStyle="ghost"
            onAction={onBack}
          />
        ) : (
          <ErrorState
            title={t('detail.offlineTitle')}
            message={errorMessage ?? t('detail.offlineMessage')}
            actionLabel={t('detail.retry')}
            onAction={onRetry}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        style={styles.screen}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { paddingTop: insets.top, backgroundColor: heroColor }]}>
          <PokeBallMark size={210} thickness={30} style={styles.heroMark} />
          <Animated.View
            style={heroFade}
            onLayout={(e) => {
              // Si compatta quando il fondo dei tipi passa sotto la barra fissa.
              const { y, height } = e.nativeEvent.layout;
              collapseAt.set(Math.max(1, y + height - insets.top - NAV_HEIGHT));
            }}>
            {nav}
            {pokemon ? (
              <>
                <View style={styles.titleRow}>
                  <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit accessibilityRole="header">
                    {name}
                  </Text>
                  <Text style={styles.number}>{formatNumber(pokemon.id)}</Text>
                </View>
                <View style={styles.types}>
                  {pokemon.types.map((t) => (
                    <TypeBadge key={t} type={t} size="large" />
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.heroSkeleton}>
                <SkeletonBlock width="55%" height={28} />
                <SkeletonBlock width={90} height={22} radius={999} />
              </View>
            )}
          </Animated.View>
          <View style={styles.sheetCap} />
          <View style={styles.artworkWrap}>
            {pokemon ? (
              <Image
                source={
                  showShiny
                    ? getShinyArtworkUrl(pokemon.id, artworkStyle)
                    : getArtworkUrl(pokemon.id, artworkStyle)
                }
                style={styles.artwork}
                contentFit="contain"
                transition={200}
                accessibilityLabel={t(showShiny ? 'detail.artworkShinyLabel' : 'detail.artworkLabel', { name })}
              />
            ) : (
              <SkeletonBlock width={140} height={140} radius={70} style={styles.artworkSkeleton} />
            )}
          </View>
        </View>

        <View style={styles.sheet}>
          {pokemon && (
            <ShinyControls
              showShiny={showShiny}
              onShowShinyChange={setShowShiny}
              isCaught={isShinyCaught}
              onToggleCaught={onToggleShinyCaught}
            />
          )}
          {pokemon && <DetailTabs value={tab} onChange={onTabChange} />}
          {pokemon && tab === 'artwork' ? (
            <ArtworkGallery
              artworks={artworks}
              isLoading={isArtworksLoading}
              errorMessage={artworksErrorMessage}
              pokemonName={name}
              onRetry={onArtworksRetry}
            />
          ) : pokemon && tab === 'evolutions' ? (
            <EvolutionChain
              chain={evolutionChain}
              isLoading={isEvolutionsLoading}
              errorMessage={evolutionsErrorMessage}
              currentId={pokemon.id}
              onOpenPokemon={onOpenEvolution}
              onOpenItem={onOpenItem}
              onOpenLocation={onOpenLocation}
              onRetry={onEvolutionsRetry}
            />
          ) : pokemon && tab === 'moves' ? (
            <LearnedMoves
              key={pokemon.id}
              learnset={learnset}
              isLoading={isLearnsetLoading}
              errorMessage={learnsetErrorMessage}
              pokemonName={name}
              onOpenMove={onOpenMove}
              onRetry={onLearnsetRetry}
            />
          ) : pokemon ? (
            <>
              {isDescriptionLoading ? (
                <View style={styles.descriptionSkeleton}>
                  <SkeletonBlock width="100%" height={12} />
                  <SkeletonBlock width="92%" height={12} />
                  <SkeletonBlock width="60%" height={12} />
                </View>
              ) : (
                <Text style={styles.description}>
                  {pokemon.description ?? t('detail.noDescription')}
                </Text>
              )}

              <View style={styles.facts}>
                <Fact label={t('detail.height')} value={formatHeight(pokemon.height)} />
                <Fact label={t('detail.weight')} value={formatWeight(pokemon.weight)} />
              </View>

              <Pressable
                onPress={onCompare}
                accessibilityRole="button"
                accessibilityLabel={t('detail.compareLabel', { name })}
                style={({ pressed }) => [styles.compare, pressed && styles.comparePressed]}>
                <Icon name="compare" size={16} color={colors.text} />
                <Text style={styles.compareLabel}>{t('detail.compare')}</Text>
              </Pressable>

              <Section title={t('detail.abilities')}>
                <View style={styles.abilities}>
                  {pokemon.abilities.map((ability) => {
                    // Id dall'indice locale e nome nella lingua in uso; senza voce resta il nome di PokéAPI.
                    const entry = getAbilityIndexEntryByName(ability.name);
                    const label = entry ? localName('ability', entry.id, entry.label) : formatName(ability.name);
                    return (
                      <Pressable
                        key={ability.name}
                        onPress={entry ? () => onOpenAbility(entry.id) : undefined}
                        disabled={!entry}
                        accessibilityRole={entry ? 'link' : 'text'}
                        accessibilityLabel={ability.isHidden ? t('detail.hiddenAbilityLabel', { name: label }) : label}
                        accessibilityHint={entry ? t('detail.openAbility') : undefined}
                        style={({ pressed }) => [styles.ability, pressed && styles.abilityPressed]}>
                        <Text style={styles.abilityName}>{label}</Text>
                        {ability.isHidden && <Text style={styles.abilityHidden}>{t('detail.hidden')}</Text>}
                        {entry && <Icon name="next" size={14} color={colors.textSubtle} />}
                      </Pressable>
                    );
                  })}
                </View>
              </Section>

              <Section title={t('detail.baseStats')}>
                <View style={styles.stats}>
                  {pokemon.stats.map((stat) => (
                    <StatBar
                      key={stat.name}
                      label={STAT_LABELS[stat.name]}
                      value={stat.value}
                      color={TYPE_COLORS[type ?? 'normal']}
                    />
                  ))}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{t('detail.total')}</Text>
                    <Text style={styles.totalValue}>
                      {pokemon.stats.reduce((sum, stat) => sum + stat.value, 0)}
                    </Text>
                  </View>
                </View>
              </Section>

              <TypeDefenseSection
                type={type ?? 'normal'}
                groups={typeDefense}
                isLoading={isTypeDefenseLoading}
                errorMessage={typeDefenseErrorMessage}
                onRetry={onTypeDefenseRetry}
              />

              <PokemonForms
                key={pokemon.id}
                forms={forms}
                isLoading={isFormsLoading}
                errorMessage={formsErrorMessage}
                pokemonName={name}
                onRetry={onFormsRetry}
              />

              <PokemonEncounters
                groups={encounters}
                isLoading={isEncountersLoading}
                errorMessage={encountersErrorMessage}
                pokemonName={name}
                onOpenLocation={onOpenLocation}
                onRetry={onEncountersRetry}
              />
            </>
          ) : (
            <View style={styles.descriptionSkeleton}>
              <SkeletonBlock width="100%" height={12} />
              <SkeletonBlock width="80%" height={12} />
              <View style={styles.facts}>
                <SkeletonBlock width="48%" height={48} radius={12} />
                <SkeletonBlock width="48%" height={48} radius={12} />
              </View>
              {Array.from({ length: 6 }, (_, i) => (
                <SkeletonBlock key={i} width="100%" height={10} />
              ))}
            </View>
          )}
        </View>
      </Animated.ScrollView>
      <CompactHeader
        scrollY={scrollY}
        collapseAt={collapseAt}
        topInset={insets.top}
        backgroundColor={heroColor}
        pokemon={pokemon}
        onBack={onBack}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        previousId={previousId}
        nextId={nextId}
        onNavigate={onNavigate}
      />
    </View>
  );
}

/**
 * Intestazione fissa che scende dall'alto quando si scorre la scheda:
 * indietro, icone dei tipi, nome, preferito e frecce precedente/successivo.
 */
function CompactHeader({
  scrollY,
  collapseAt,
  topInset,
  backgroundColor,
  pokemon,
  onBack,
  isFavorite,
  onToggleFavorite,
  previousId,
  nextId,
  onNavigate,
}: {
  scrollY: SharedValue<number>;
  collapseAt: SharedValue<number>;
  topInset: number;
  backgroundColor: string;
  pokemon: PokemonDetail | undefined;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  previousId: number | null;
  nextId: number | null;
  onNavigate: (id: number) => void;
}) {
  const height = topInset + NAV_HEIGHT;
  const shown = useSharedValue(0);
  useAnimatedReaction(
    () => scrollY.value >= collapseAt.value,
    (collapsed, previous) => {
      if (collapsed !== previous) shown.value = withTiming(collapsed ? 1 : 0, { duration: 220 });
    },
  );
  // Nascosta resta sopra lo schermo, così non copre i pulsanti dell'intestazione grande.
  const barStyle = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (shown.value - 1) * height }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (1 - shown.value) * 10 }],
  }));
  const { t } = useTranslation('pokemon');
  const name = pokemon ? pokemonName(pokemon.id, pokemon.name) : '';

  return (
    <Animated.View style={[styles.compact, { height, paddingTop: topInset, backgroundColor }, barStyle]}>
      <NavButton icon="back" label={t('detail.back')} onPress={onBack} />
      <Animated.View style={[styles.compactTitle, titleStyle]}>
        {pokemon?.types.map((t) => (
          <TypeIcon key={t} type={t} size={22} />
        ))}
        <Text style={styles.compactName} numberOfLines={1} accessibilityRole="header">
          {name}
        </Text>
      </Animated.View>
      {pokemon && (
        <NavButton
          icon={isFavorite ? 'heart' : 'heartOutline'}
          label={isFavorite ? t('detail.removeFavorite') : t('detail.addFavorite')}
          color={isFavorite ? colors.accent : undefined}
          onPress={onToggleFavorite}
        />
      )}
      <NavButton
        icon="previous"
        label={previousId ? t('detail.previous', { number: formatNumber(previousId) }) : t('detail.noPrevious')}
        onPress={previousId ? () => onNavigate(previousId) : undefined}
      />
      <NavButton
        icon="next"
        label={nextId ? t('detail.next', { number: formatNumber(nextId) }) : t('detail.noNext')}
        onPress={nextId ? () => onNavigate(nextId) : undefined}
      />
    </Animated.View>
  );
}

function NavButton({
  icon,
  label,
  text,
  iconAfter = false,
  color = colors.text,
  onPress,
}: {
  icon: IconName;
  label: string;
  text?: string;
  iconAfter?: boolean;
  color?: string;
  onPress?: () => void;
}) {
  const disabled = !onPress;
  const tint = disabled ? 'rgba(29, 28, 34, 0.25)' : color;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.navButton,
        iconAfter && styles.navButtonReverse,
        pressed && styles.pressed,
      ]}>
      <Icon name={icon} size={18} color={tint} />
      {text && <Text style={[styles.navText, { color: tint }]}>{text}</Text>}
    </Pressable>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
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
    paddingBottom: ARTWORK_SIZE + 8,
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
    top: 70,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: NAV_HEIGHT,
  },
  compact: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(29, 28, 34, 0.12)',
  },
  compactTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 4,
  },
  compactName: {
    flexShrink: 1,
    fontFamily: fonts.displayBold,
    fontSize: 19,
    letterSpacing: -0.4,
    color: colors.text,
    marginLeft: 2,
  },
  navSide: {
    flexDirection: 'row',
    gap: 4,
  },
  navButton: {
    minWidth: 44,
    height: 44,
    paddingHorizontal: 6,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  navButtonReverse: {
    flexDirection: 'row-reverse',
  },
  pressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  navText: {
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  name: {
    flexShrink: 1,
    fontFamily: fonts.displayBold,
    fontSize: 34,
    letterSpacing: -0.8,
    color: colors.text,
  },
  number: {
    fontFamily: fonts.monoBold,
    fontSize: 16,
    color: 'rgba(29, 28, 34, 0.6)',
    marginBottom: 6,
  },
  types: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  heroSkeleton: {
    gap: 10,
    marginTop: 4,
  },
  artworkWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 4,
    alignItems: 'center',
  },
  artworkSkeleton: {
    marginBottom: 20,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 18,
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
  facts: {
    flexDirection: 'row',
    gap: 10,
  },
  fact: {
    flex: 1,
    backgroundColor: colors.factBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  factLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textSubtle,
  },
  factValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  compare: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
  },
  comparePressed: {
    backgroundColor: colors.factBackground,
  },
  compareLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  abilities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.factBackground,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  abilityPressed: {
    opacity: 0.7,
  },
  abilityName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text,
  },
  abilityHidden: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textSubtle,
  },
  stats: {
    gap: 6,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  totalLabel: {
    width: 72,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.text,
  },
  totalValue: {
    width: 32,
    textAlign: 'right',
    fontFamily: fonts.monoBold,
    fontSize: 13,
    color: colors.text,
  },
});
