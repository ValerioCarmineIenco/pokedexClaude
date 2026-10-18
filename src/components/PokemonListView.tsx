import { FlashList, type ViewToken } from '@shopify/flash-list';
import { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GENERATIONS, getGenerationById, LAST_POKEMON_ID } from '@/api/generations';
import type { ViewMode } from '@/hooks/useViewMode';
import { colors } from '@/theme/colors';
import type { Generation, PokemonSummary } from '@/types/pokemon';
import { formatNumber } from '@/utils/format';
import { generationSize } from '@/utils/generation';

import { ErrorState } from './ErrorState';
import { ErrorToast } from './ErrorToast';
import { ListHeader } from './ListHeader';
import { ListSectionHeader } from './ListSectionHeader';
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
  /** Pokémon da mostrare: l'elenco caricato, o i risultati della ricerca. */
  pokemon: PokemonSummary[];
  /** Quanti Pokémon dell'elenco sono stati caricati (senza contare la ricerca). */
  loadedCount: number;
  searchText: string;
  onSearchTextChange: (text: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  /** Generazione mostrata; null = tutte in sequenza. */
  generationId: number | null;
  onGenerationChange: (generationId: number | null) => void;
  /** Mostra solo i preferiti (`pokemon` sono allora i preferiti, già filtrati). */
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (favoritesOnly: boolean) => void;
  /** Quanti preferiti ci sono in tutto, senza filtri di generazione o ricerca. */
  favoritesCount: number;
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
  onOpenSettings: () => void;
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
  favoritesOnly,
  onFavoritesOnlyChange,
  favoritesCount,
  isLoading,
  errorMessage,
  hasNextPage,
  isFetchingNextPage,
  isRefreshing,
  onEndReached,
  onRefresh,
  onRetry,
  onPressPokemon,
  onOpenSettings,
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
  const changeFavoritesOnly = (value: boolean) => {
    firstVisibleIndex.current = 0;
    setStartIndex(undefined);
    onFavoritesOnlyChange(value);
  };

  const caption = favoritesOnly
    ? favoritesCaption(pokemon.length, isSearching, generation)
    : isSearching
      ? `${pokemon.length} ${pokemon.length === 1 ? 'risultato' : 'risultati'} tra ${
          generation ? `${generationSize(generation)} Pokémon di ${generation.region}` : `${LAST_POKEMON_ID} Pokémon`
        }`
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
      favoritesOnly={favoritesOnly}
      onFavoritesOnlyChange={changeFavoritesOnly}
      caption={caption}
      onOpenSettings={onOpenSettings}
      compact={compact}
    />
  );

  // I preferiti vengono dall'indice locale: niente caricamento né errori di rete.
  const usesNetwork = !favoritesOnly && !isSearching;

  // Errore senza nulla da mostrare: schermo intero con Riprova.
  if (errorMessage && loadedCount === 0 && usesNetwork) {
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
      {isLoading && usesNetwork ? (
        skeletons(isGrid ? 8 : 9)
      ) : (
        <FlashList
          key={`${viewMode}-${generationId ?? 'all'}-${favoritesOnly ? 'favorites' : 'all'}`}
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
              <ListSectionHeader
                title={item.generation.name}
                meta={`${item.generation.region} · ${formatNumber(item.generation.firstId)}–${formatNumber(item.generation.lastId)}`}
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
          onEndReached={usesNetwork && hasNextPage ? onEndReached : undefined}
          onEndReachedThreshold={0.6}
          ListFooterComponent={isFetchingNextPage && usesNetwork ? skeletons(2) : null}
          ListEmptyComponent={
            isSearching ? (
              <ErrorState
                title="Nessun risultato"
                message={`Nessun ${favoritesOnly ? 'preferito' : 'Pokémon'} ${generation ? `di ${generation.region} ` : ''}si chiama "${searchText.trim()}".`}
                actionLabel="Cancella ricerca"
                actionStyle="ghost"
                onAction={() => onSearchTextChange('')}
              />
            ) : favoritesOnly ? (
              <ErrorState
                title={favoritesCount === 0 ? 'Nessun preferito' : `Nessun preferito di ${generation?.region}`}
                message="Apri la scheda di un Pokémon e tocca il cuore in alto per aggiungerlo ai preferiti."
                glyph="♡"
                actionLabel="Mostra tutti i Pokémon"
                actionStyle="ghost"
                onAction={() => changeFavoritesOnly(false)}
              />
            ) : null
          }
          refreshControl={
            favoritesOnly ? undefined : (
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent}
                colors={[colors.accent]}
              />
            )
          }
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        />
      )}
      {errorMessage && loadedCount > 0 && !favoritesOnly && (
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

function favoritesCaption(shown: number, isSearching: boolean, generation: Generation | undefined): string {
  const where = generation ? ` · ${generation.name} · ${generation.region}` : '';
  if (isSearching) return `${shown} ${shown === 1 ? 'risultato' : 'risultati'} tra i preferiti${where}`;
  return `${shown} ${shown === 1 ? 'preferito' : 'preferiti'}${where}`;
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
