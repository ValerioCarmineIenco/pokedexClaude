import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GENERATIONS, LAST_POKEMON_ID } from '@/api/generations';
import { getArtworkUrl } from '@/api/pokemon';
import { useArtworkStyle } from '@/hooks/useArtworkStyle';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { primaryType, TYPE_COLORS, typeTint } from '@/theme/typeColors';
import type { EvolutionChain as Chain } from '@/types/evolution';
import type { PokemonLearnset } from '@/types/learnset';
import type { MoveSummary } from '@/types/move';
import type { PokemonArtworks, PokemonDetail } from '@/types/pokemon';
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
import { SkeletonBlock } from './Skeleton';
import { StatBar } from './StatBar';
import { TypeBadge } from './TypeBadge';
import { TypeDefenseSection } from './TypeDefenseSection';

const ARTWORK_SIZE = 180;
/** Parte bianca arrotondata in fondo all'intestazione, su cui poggia l'artwork. */
const SHEET_CAP = 72;

const REGIONS = GENERATIONS.map((g) => g.region);
const INVALID_ID_MESSAGE = `Questo Pokédex contiene solo i ${LAST_POKEMON_ID} Pokémon di ${
  REGIONS.length > 1 ? `${REGIONS.slice(0, -1).join(', ')} e ${REGIONS.at(-1)}` : REGIONS[0]
}.`;

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
  learnset,
  isLearnsetLoading,
  learnsetErrorMessage,
  onLearnsetRetry,
  onOpenMove,
  typeDefense,
  isTypeDefenseLoading,
  typeDefenseErrorMessage,
  onTypeDefenseRetry,
}: PokemonDetailViewProps) {
  const insets = useSafeAreaInsets();
  const [artworkStyle] = useArtworkStyle();
  const type = pokemon ? primaryType(pokemon.types) : null;

  const backButton = <NavButton icon="back" label="Torna all'elenco" onPress={onBack} />;
  const nav = (
    <View style={styles.nav}>
      {backButton}
      <View style={styles.navSide}>
        {pokemon && (
          <NavButton
            icon={isFavorite ? 'heart' : 'heartOutline'}
            label={isFavorite ? 'Togli dai preferiti' : 'Aggiungi ai preferiti'}
            color={isFavorite ? colors.accent : undefined}
            onPress={onToggleFavorite}
          />
        )}
        <NavButton
          icon="previous"
          label={previousId ? `Pokémon precedente, ${formatNumber(previousId)}` : 'Nessun precedente'}
          text={previousId ? formatNumber(previousId) : undefined}
          onPress={previousId ? () => onNavigate(previousId) : undefined}
        />
        <NavButton
          icon="next"
          iconAfter
          label={nextId ? `Pokémon successivo, ${formatNumber(nextId)}` : 'Nessun successivo'}
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
            title="Pokémon non trovato"
            message={INVALID_ID_MESSAGE}
            actionLabel="Torna all'elenco"
            actionStyle="ghost"
            onAction={onBack}
          />
        ) : (
          <ErrorState
            title="Nessuna connessione"
            message={errorMessage ?? 'Non riesco a raggiungere il Pokédex. Controlla la rete e riprova.'}
            actionLabel="Riprova"
            onAction={onRetry}
          />
        )}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }}
      showsVerticalScrollIndicator={false}>
      <View
        style={[
          styles.hero,
          { paddingTop: insets.top, backgroundColor: type ? typeTint(type, 0.42) : colors.skeleton },
        ]}>
        {nav}
        <PokeBallMark size={210} thickness={30} style={styles.heroMark} />
        {pokemon ? (
          <>
            <View style={styles.titleRow}>
              <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit accessibilityRole="header">
                {formatName(pokemon.name)}
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
        <View style={styles.sheetCap} />
        <View style={styles.artworkWrap}>
          {pokemon ? (
            <Image
              source={getArtworkUrl(pokemon.id, artworkStyle)}
              style={styles.artwork}
              contentFit="contain"
              transition={200}
              accessibilityLabel={`Artwork di ${formatName(pokemon.name)}`}
            />
          ) : (
            <SkeletonBlock width={140} height={140} radius={70} style={styles.artworkSkeleton} />
          )}
        </View>
      </View>

      <View style={styles.sheet}>
        {pokemon && <DetailTabs value={tab} onChange={onTabChange} />}
        {pokemon && tab === 'artwork' ? (
          <ArtworkGallery
            artworks={artworks}
            isLoading={isArtworksLoading}
            errorMessage={artworksErrorMessage}
            pokemonName={formatName(pokemon.name)}
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
            pokemonName={formatName(pokemon.name)}
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
                {pokemon.description ?? 'Nessuna descrizione in italiano disponibile.'}
              </Text>
            )}

            <View style={styles.facts}>
              <Fact label="Altezza" value={formatHeight(pokemon.height)} />
              <Fact label="Peso" value={formatWeight(pokemon.weight)} />
            </View>

            <Pressable
              onPress={onCompare}
              accessibilityRole="button"
              accessibilityLabel={`Confronta ${formatName(pokemon.name)} con un altro Pokémon`}
              style={({ pressed }) => [styles.compare, pressed && styles.comparePressed]}>
              <Icon name="compare" size={16} color={colors.text} />
              <Text style={styles.compareLabel}>Confronta con un altro Pokémon</Text>
            </Pressable>

            <Section title="Abilità">
              <View style={styles.abilities}>
                {pokemon.abilities.map((ability) => (
                  <View key={ability.name} style={styles.ability}>
                    <Text style={styles.abilityName}>{formatName(ability.name)}</Text>
                    {ability.isHidden && <Text style={styles.abilityHidden}>Nascosta</Text>}
                  </View>
                ))}
              </View>
            </Section>

            <Section title="Statistiche base">
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
                  <Text style={styles.totalLabel}>Totale</Text>
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
    </ScrollView>
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
    height: 52,
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
