import { FlashList, type ViewToken } from '@shopify/flash-list';
import { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GENERATIONS, getGenerationById, LAST_POKEMON_ID } from '@/api/generations';
import type { ViewMode } from '@/hooks/useViewMode';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import type { Generation, PokemonSummary } from '@/types/pokemon';
import { formatNumber } from '@/utils/format';
import { generationSize } from '@/utils/generation';

import { ErrorState } from './ErrorState';
import { ErrorToast } from './ErrorToast';
import { ListHeader } from './ListHeader';
import { PokemonCard } from './PokemonCard';
import { SkeletonCard } from './Skeleton';

const GAP = 10;
const SIDE = 12;

/** Elementi dell'elenco: le card e, con tutte le generazioni, un'intestazione per ciascuna. */
type ListItem =
  | { kind: 'pokemon'; pokemon: PokemonSummary }
  | { kind: 'generation'; generation: Generation; isFirst: boolean };

function buildItems(pokemon: PokemonSummary[], withHeaders: boolean): ListItem[] {
  const items: ListItem[] = [];
  let current: number | null = null;
  for (const p of pokemon) {
    if (withHeaders && p.generation !== current) {
      const generation = getGenerationById(p.generation);
      if (generation) items.push({ kind: 'generation', generation, isFirst: current === null });
      current = p.generation;
    }
    items.push({ kind: 'pokemon', pokemon: p });
  }
  return items;
}

export type PokemonListViewProps = {
  /** Pokémon da mostrare, già filtrati dalla ricerca. */
  pokemon: PokemonSummary[];
  /** Quanti Pokémon sono stati caricati in tutto (prima del filtro). */
  loadedCount: number;
  searchText: string;
  onSearchTextChange: (text: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  /** Generazione mostrata; null = tutte in sequenza. */
  generationId: number | null;
  onGenerationChange: (generationId: number | null) => void;
  /** Primo caricamento, nessun dato ancora. */
  isLoading: boolean;
  errorMessage: string | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isRefreshing: boolean;
  onEndReached: () => void;
  onRefresh: () => void;
  onRetry: () => void;
  onPressPokemon: (pokemon: PokemonSummary) => void;
};

export function PokemonListView({
  pokemon,
  loadedCount,
  searchText,
  onSearchTextChange,
  viewMode,
  onViewModeChange,
  generationId,
  onGenerationChange,
  isLoading,
  errorMessage,
  hasNextPage,
  isFetchingNextPage,
  isRefreshing,
  onEndReached,
  onRefresh,
  onRetry,
  onPressPokemon,
}: PokemonListViewProps) {
  const insets = useSafeAreaInsets();
  const isGrid = viewMode === 'grid';
  const isSearching = searchText.trim().length > 0;
  const generation = generationId == null ? undefined : getGenerationById(generationId);

  const items = useMemo(() => buildItems(pokemon, generation == null), [pokemon, generation]);

  // Primo Pokémon visibile: al cambio di vista l'elenco riparte da lì.
  const firstVisibleIndex = useRef(0);
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<ListItem>[] }) => {
      const first = viewableItems.find((item) => item.index != null);
      if (first?.index != null) firstVisibleIndex.current = first.index;
    },
    [],
  );

  const [startIndex, setStartIndex] = useState<number | undefined>(undefined);
  const changeViewMode = (mode: ViewMode) => {
    if (mode === viewMode) return;
    setStartIndex(firstVisibleIndex.current || undefined);
    onViewModeChange(mode);
  };
  // Cambiando generazione l'elenco riparte dall'inizio.
  const changeGeneration = (id: number | null) => {
    firstVisibleIndex.current = 0;
    setStartIndex(undefined);
    onGenerationChange(id);
  };

  const caption = isSearching
    ? `${pokemon.length} ${pokemon.length === 1 ? 'risultato' : 'risultati'} tra ${loadedCount} Pokémon caricati`
    : generation
      ? `${generationSize(generation)} Pokémon · ${generation.name} · ${generation.region}`
      : `${LAST_POKEMON_ID} Pokémon · ${GENERATIONS.length} generazioni`;

  const header = (compact = false) => (
    <ListHeader
      searchText={searchText}
      onSearchTextChange={onSearchTextChange}
      viewMode={viewMode}
      onViewModeChange={changeViewMode}
      generationId={generationId}
      onGenerationChange={changeGeneration}
      caption={caption}
      compact={compact}
    />
  );

  // Errore senza nulla da mostrare: schermo intero con Riprova.
  if (errorMessage && loadedCount === 0) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {header(true)}
        <ErrorState
          title="Nessuna connessione"
          message={errorMessage}
          actionLabel="Riprova"
          onAction={onRetry}
        />
      </View>
    );
  }

  const skeletons = (count: number) => (
    <View style={[styles.skeletons, isGrid && styles.skeletonsGrid]}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={isGrid ? styles.skeletonGridCell : styles.rowCell}>
          <SkeletonCard variant={viewMode} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {header()}
      {isLoading ? (
        skeletons(isGrid ? 8 : 9)
      ) : (
        <FlashList
          key={`${viewMode}-${generationId ?? 'all'}`}
          data={items}
          numColumns={isGrid ? 2 : 1}
          initialScrollIndex={startIndex}
          keyExtractor={(item) =>
            item.kind === 'pokemon' ? String(item.pokemon.id) : `gen-${item.generation.id}`
          }
          getItemType={(item) => item.kind}
          overrideItemLayout={(layout, item, _index, maxColumns) => {
            if (item.kind === 'generation') layout.span = maxColumns;
          }}
          renderItem={({ item }) =>
            item.kind === 'generation' ? (
              <GenerationHeader
                generation={item.generation}
                isFirst={item.isFirst}
                inset={isGrid ? GAP / 2 : 0}
              />
            ) : (
              <View style={isGrid ? styles.gridCell : styles.rowCell}>
                <PokemonCard pokemon={item.pokemon} variant={viewMode} onPress={onPressPokemon} />
              </View>
            )
          }
          contentContainerStyle={{
            paddingHorizontal: isGrid ? SIDE - GAP / 2 : SIDE,
            paddingTop: 2,
            paddingBottom: insets.bottom + 24,
          }}
          onViewableItemsChanged={onViewableItemsChanged}
          onEndReached={!isSearching && hasNextPage ? onEndReached : undefined}
          onEndReachedThreshold={0.6}
          ListFooterComponent={isFetchingNextPage && !isSearching ? skeletons(2) : null}
          ListEmptyComponent={
            isSearching ? (
              <ErrorState
                title="Nessun risultato"
                message={`Nessun Pokémon caricato si chiama "${searchText.trim()}".`}
                actionLabel="Cancella ricerca"
                actionStyle="ghost"
                onAction={() => onSearchTextChange('')}
              />
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        />
      )}
      {errorMessage && loadedCount > 0 && (
        <ErrorToast
          message={errorMessage}
          actionLabel="Riprova"
          onAction={onRetry}
          bottomInset={insets.bottom}
        />
      )}
    </View>
  );
}

function GenerationHeader({
  generation,
  isFirst,
  inset,
}: {
  generation: Generation;
  isFirst: boolean;
  inset: number;
}) {
  return (
    <View
      style={[styles.genHeader, { paddingHorizontal: inset }, !isFirst && styles.genHeaderSpaced]}
      accessibilityRole="header">
      <Text style={styles.genTitle}>{generation.name}</Text>
      <Text style={styles.genMeta}>
        {generation.region} · {formatNumber(generation.firstId)}–{formatNumber(generation.lastId)}
      </Text>
      <View style={styles.genRule} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gridCell: {
    flex: 1,
    paddingHorizontal: GAP / 2,
    paddingBottom: GAP,
  },
  skeletonGridCell: {
    width: '50%',
    paddingHorizontal: GAP / 2,
    paddingBottom: GAP,
  },
  rowCell: {
    paddingBottom: 8,
  },
  genHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    paddingTop: 4,
    paddingBottom: 10,
  },
  genHeaderSpaced: {
    paddingTop: 18,
  },
  genTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    letterSpacing: -0.2,
    color: colors.text,
  },
  genMeta: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.2,
    color: colors.textSubtle,
  },
  genRule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    alignSelf: 'center',
  },
  skeletons: {
    paddingHorizontal: SIDE,
  },
  skeletonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIDE - GAP / 2,
  },
});
