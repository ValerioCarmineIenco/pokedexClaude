import { FlashList, type ViewToken } from '@shopify/flash-list';
import { useCallback, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LAST_POKEMON_ID } from '@/api/pokemon';
import type { ViewMode } from '@/hooks/useViewMode';
import { colors } from '@/theme/colors';
import type { PokemonSummary } from '@/types/pokemon';

import { ErrorState } from './ErrorState';
import { ErrorToast } from './ErrorToast';
import { ListHeader } from './ListHeader';
import { PokemonCard } from './PokemonCard';
import { SkeletonCard } from './Skeleton';

const GAP = 10;
const SIDE = 12;

export type PokemonListViewProps = {
  /** Pokémon da mostrare, già filtrati dalla ricerca. */
  pokemon: PokemonSummary[];
  /** Quanti Pokémon sono stati caricati in tutto (prima del filtro). */
  loadedCount: number;
  searchText: string;
  onSearchTextChange: (text: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
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

  // Primo Pokémon visibile: al cambio di vista l'elenco riparte da lì.
  const firstVisibleIndex = useRef(0);
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<PokemonSummary>[] }) => {
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

  const caption = isSearching
    ? `${pokemon.length} ${pokemon.length === 1 ? 'risultato' : 'risultati'} tra ${loadedCount} Pokémon caricati`
    : `${LAST_POKEMON_ID} Pokémon · prima generazione`;

  const header = (compact = false) => (
    <ListHeader
      searchText={searchText}
      onSearchTextChange={onSearchTextChange}
      viewMode={viewMode}
      onViewModeChange={changeViewMode}
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
          key={viewMode}
          data={pokemon}
          numColumns={isGrid ? 2 : 1}
          initialScrollIndex={startIndex}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={isGrid ? styles.gridCell : styles.rowCell}>
              <PokemonCard pokemon={item} variant={viewMode} onPress={onPressPokemon} />
            </View>
          )}
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
  skeletons: {
    paddingHorizontal: SIDE,
  },
  skeletonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIDE - GAP / 2,
  },
});
