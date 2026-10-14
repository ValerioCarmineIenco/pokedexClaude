import { Image } from 'expo-image';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getArtworkUrl } from '@/api/pokemon';
import { useArtworkStyle } from '@/hooks/useArtworkStyle';
import type {
  EncounterMethodGroup,
  LocationArea,
  LocationDetail,
  LocationEncounter,
  LocationSummary,
} from '@/types/location';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { getVersionColor } from '@/theme/versionColors';
import { formatName } from '@/utils/format';

import { ErrorState } from '../ErrorState';
import { Icon } from '../Icon';
import { SkeletonBlock } from '../Skeleton';

/** Verde acqua delle località: badge della regione, etichette dei metodi, livelli. */
const LOCATION_COLOR = colors.pokemonBadgeText;
const LOCATION_SOFT = colors.pokemonBadge;
/** Barra sotto l'area selezionata. */
const TAB_ACCENT = '#5E7A8A';
const RATE_COLOR = '#2E8B57';
const RATE_SOFT = '#DAF0E2';
const CONDITION_COLOR = '#566778';
const CONDITION_SOFT = '#E4E8ED';

const SPRITE_SIZE = 76;
/** Metà altezza dell'etichetta del metodo, che poggia a cavallo del bordo della carta. */
const METHOD_LABEL_OFFSET = 18;

export type LocationDetailViewProps = {
  /** Dati dell'indice locale, disponibili subito per l'intestazione. */
  summary: LocationSummary | undefined;
  location: LocationDetail | undefined;
  isLoading: boolean;
  errorMessage: string | null;
  /** L'id della rotta non è una località dell'app. */
  isInvalidId: boolean;
  onOpenPokemon: (id: number) => void;
  onBack: () => void;
  onRetry: () => void;
};

export function LocationDetailView({
  summary,
  location,
  isLoading,
  errorMessage,
  isInvalidId,
  onOpenPokemon,
  onBack,
  onRetry,
}: LocationDetailViewProps) {
  const insets = useSafeAreaInsets();
  const [areaIndex, setAreaIndex] = useState(0);

  const header = location ?? summary;
  const areas = location?.areas ?? [];
  const area: LocationArea | undefined = areas[Math.min(areaIndex, areas.length - 1)];

  const nav = (
    <View style={styles.nav}>
      <Pressable
        onPress={onBack}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Torna alle località"
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <Icon name="back" size={18} color={colors.text} />
      </Pressable>
      <Text style={styles.title} numberOfLines={2} accessibilityRole="header">
        {header?.name.toUpperCase() ?? ''}
      </Text>
      <View style={styles.navSide}>
        {header?.region && (
          <View style={styles.regionBadge}>
            <Text style={styles.regionLabel} numberOfLines={1}>
              {header.region.label}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (isInvalidId || (!location && !isLoading)) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {nav}
        {isInvalidId ? (
          <ErrorState
            title="Località non trovata"
            message="Questa località non esiste nel Pokédex."
            actionLabel="Torna alle località"
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
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {nav}
      {location ? (
        <FlatList
          data={area?.methods ?? []}
          keyExtractor={(group) => group.method.name}
          renderItem={({ item }) => <MethodCard group={item} onOpenPokemon={onOpenPokemon} />}
          ListHeaderComponent={
            areas.length > 1 ? (
              <AreaTabs areas={areas} selected={area?.id} onSelect={setAreaIndex} />
            ) : null
          }
          ListEmptyComponent={
            <Text style={styles.empty}>Nessun Pokémon selvatico in questa località.</Text>
          }
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          initialNumToRender={3}
          windowSize={7}
        />
      ) : (
        <LoadingCards />
      )}
    </View>
  );
}

function AreaTabs({
  areas,
  selected,
  onSelect,
}: {
  areas: LocationArea[];
  selected: number | undefined;
  onSelect: (index: number) => void;
}) {
  return (
    <View style={styles.areas}>
      <View style={styles.areasTitleRow}>
        <Icon name="map" size={16} color={colors.text} />
        <Text style={styles.areasTitle} accessibilityRole="header">
          Aree
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsRow}
        accessibilityRole="tablist">
        {areas.map((area, index) => {
          const isSelected = area.id === selected;
          return (
            <Pressable
              key={area.id}
              onPress={() => onSelect(index)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => [
                styles.tab,
                isSelected && styles.tabSelected,
                pressed && styles.tabPressed,
              ]}>
              <Text style={[styles.tabLabel, isSelected && styles.tabLabelSelected]}>
                {area.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function MethodCard({
  group,
  onOpenPokemon,
}: {
  group: EncounterMethodGroup;
  onOpenPokemon: (id: number) => void;
}) {
  return (
    <View style={styles.methodWrap}>
      <View style={styles.card}>
        {group.encounters.map((encounter, index) => (
          <EncounterRow
            key={`${encounter.pokemon.id}-${index}`}
            encounter={encounter}
            description={group.method.description}
            onOpenPokemon={onOpenPokemon}
          />
        ))}
      </View>
      <View style={styles.methodLabelWrap} pointerEvents="none">
        <View style={styles.methodLabel}>
          <Text style={styles.methodLabelText} numberOfLines={1}>
            {group.method.label}
          </Text>
        </View>
      </View>
    </View>
  );
}

function EncounterRow({
  encounter,
  description,
  onOpenPokemon,
}: {
  encounter: LocationEncounter;
  description: string;
  onOpenPokemon: (id: number) => void;
}) {
  const [artworkStyle] = useArtworkStyle();
  const { pokemon, minLevel, maxLevel, chance } = encounter;
  const name = formatName(pokemon.name);
  const level = minLevel === maxLevel ? `${minLevel}` : `${minLevel}-${maxLevel}`;
  const conditions = encounter.conditions.filter((c) => !c.isDefault);

  return (
    <Pressable
      onPress={pokemon.inPokedex ? () => onOpenPokemon(pokemon.id) : undefined}
      disabled={!pokemon.inPokedex}
      accessibilityRole={pokemon.inPokedex ? 'button' : undefined}
      accessibilityLabel={`${name}, livello ${level}, probabilità ${chance !== null ? `${chance}%` : 'non indicata'}`}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <Image
        source={pokemon.inPokedex ? getArtworkUrl(pokemon.id, artworkStyle) : pokemon.artworkUrl}
        style={styles.sprite}
        contentFit="contain"
        transition={150}
      />
      <View style={styles.rowBody}>
        <Text style={styles.pokemonName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.methodDescription}>{description}</Text>
        {conditions.length > 0 && (
          <View style={styles.conditions}>
            {conditions.map((condition) => (
              <View key={condition.name} style={[styles.pill, styles.conditionPill]}>
                <Text style={[styles.pillText, { color: CONDITION_COLOR }]}>{condition.label}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.stats}>
          <View style={styles.statsColumn}>
            <View style={[styles.pill, { backgroundColor: LOCATION_SOFT }]}>
              <Text style={[styles.pillText, styles.centered, { color: LOCATION_COLOR }]}>
                Livello {level}
              </Text>
            </View>
            <View
              style={[styles.pill, { backgroundColor: chance !== null ? RATE_SOFT : colors.field }]}>
              <Text
                style={[
                  styles.pillText,
                  styles.centered,
                  { color: chance !== null ? RATE_COLOR : colors.textSubtle },
                ]}>
                Prob. {chance !== null ? `${chance}%` : '-'}
              </Text>
            </View>
          </View>
          <View style={styles.statsDivider} />
          <View style={styles.statsColumn}>
            {encounter.versions.map((version) => {
              const color = getVersionColor(version.name);
              return (
                <View key={version.id} style={[styles.pill, { backgroundColor: color.background }]}>
                  <Text
                    style={[styles.pillText, styles.centered, { color: color.text }]}
                    numberOfLines={2}>
                    {version.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function LoadingCards() {
  return (
    <View style={styles.content}>
      {Array.from({ length: 2 }, (_, i) => (
        <View key={i} style={styles.methodWrap}>
          <View style={styles.card}>
            {Array.from({ length: 3 }, (_, j) => (
              <View key={j} style={styles.row}>
                <SkeletonBlock width={SPRITE_SIZE} height={SPRITE_SIZE} radius={16} />
                <View style={[styles.rowBody, styles.skeletonBody]}>
                  <SkeletonBlock width="50%" height={16} />
                  <SkeletonBlock width="80%" height={12} />
                  <SkeletonBlock width="100%" height={26} radius={8} />
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 12,
    gap: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.field,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.displayBold,
    fontSize: 17,
    letterSpacing: 0.2,
    color: colors.text,
  },
  navSide: {
    minWidth: 44,
    maxWidth: 110,
    alignItems: 'flex-end',
  },
  regionBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: LOCATION_SOFT,
  },
  regionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: LOCATION_COLOR,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
  areas: {
    gap: 10,
    marginBottom: 6,
  },
  areasTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  areasTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  tabsScroll: {
    marginHorizontal: -16,
  },
  tabsRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 18,
    paddingTop: 9,
    paddingBottom: 6,
    borderRadius: 10,
    borderBottomWidth: 3,
    borderBottomColor: colors.line,
    backgroundColor: colors.field,
  },
  tabSelected: {
    borderBottomColor: TAB_ACCENT,
  },
  tabPressed: {
    opacity: 0.75,
  },
  tabLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.textMuted,
  },
  tabLabelSelected: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
  },
  methodWrap: {
    paddingTop: METHOD_LABEL_OFFSET,
    marginTop: 16,
  },
  card: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    paddingTop: METHOD_LABEL_OFFSET + 14,
    paddingBottom: 8,
    paddingHorizontal: 12,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.06)',
  },
  methodLabelWrap: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  methodLabel: {
    maxWidth: '100%',
    height: METHOD_LABEL_OFFSET * 2,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: LOCATION_COLOR,
    backgroundColor: colors.surface,
  },
  methodLabelText: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: LOCATION_COLOR,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 16,
  },
  rowPressed: {
    backgroundColor: colors.factBackground,
  },
  sprite: {
    width: SPRITE_SIZE,
    height: SPRITE_SIZE,
  },
  rowBody: {
    flex: 1,
    gap: 6,
  },
  skeletonBody: {
    gap: 8,
  },
  pokemonName: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  methodDescription: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 17,
    color: colors.textSubtle,
    marginTop: -4,
  },
  conditions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  conditionPill: {
    backgroundColor: CONDITION_SOFT,
    paddingHorizontal: 10,
  },
  pill: {
    minHeight: 26,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  pillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    lineHeight: 16,
  },
  centered: {
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  statsColumn: {
    flex: 1,
    gap: 6,
  },
  statsDivider: {
    width: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.line,
  },
});
