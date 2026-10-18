import { FlashList, type ViewToken } from '@shopify/flash-list';
import { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GENERATIONS, getGenerationById, LAST_POKEMON_ID } from '@/api/generations';
import type { ViewMode } from '@/hooks/useViewMode';
import { colors } from '@/theme/colors';
import { getIndexStat } from '@/api/pokemon';
import { TYPE_NAMES_IT } from '@/theme/typeNames';
import {
  DEFAULT_POKEMON_FILTERS,
  type Generation,
  type PokemonCollection,
  type PokemonFilters,
  type PokemonSummary,
} from '@/types/pokemon';
import { formatNumber } from '@/utils/format';
import { generationSize } from '@/utils/generation';

import { ErrorState } from './ErrorState';
import { ErrorToast } from './ErrorToast';
import { ListHeader } from './ListHeader';
import { ListSectionHeader } from './ListSectionHeader';
import { PokemonCard } from './PokemonCard';
import {
  CATEGORY_LABELS,
  countActiveFilters,
  PokemonFilterSheet,
  SORT_LABELS,
} from './PokemonFilterSheet';
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
  /** Mostra solo preferiti o shiny ottenuti (`pokemon` sono allora quelli, già filtrati); null = tutti. */
  collection: PokemonCollection | null;
  onCollectionChange: (collection: PokemonCollection | null) => void;
  /** Quanti Pokémon ha in tutto la raccolta mostrata, senza filtri di generazione o ricerca. */
  collectionCount: number;
  /** Shiny ottenuti tra i Pokémon della generazione mostrata (o di tutte). */
  shinyCount: number;
  /** Tipi, categoria e ordinamento; se attivi `pokemon` sono già filtrati e ordinati dall'indice. */
  filters: PokemonFilters;
  onFiltersChange: (filters: PokemonFilters) => void;
  /** Quanti Pokémon passano generazione, raccolta, ricerca e filtri, anche se non ancora caricati. */
  matchCount: number;
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
  collection,
  onCollectionChange,
  collectionCount,
  shinyCount,
  filters,
  onFiltersChange,
  matchCount,
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
  const activeFilterCount = countActiveFilters(filters);
  const isFiltering = activeFilterCount > 0;
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Le intestazioni di generazione hanno senso solo in ordine di numero crescente.
  const inNumberOrder = filters.sort === 'number' && !filters.reversed;
  const statSort = filters.sort === 'number' || filters.sort === 'name' ? null : filters.sort;

  const items = useMemo(
    () => buildItems(pokemon, generation == null && inNumberOrder),
    [pokemon, generation, inNumberOrder],
  );

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
  const changeCollection = (value: PokemonCollection | null) => {
    firstVisibleIndex.current = 0;
    setStartIndex(undefined);
    onCollectionChange(value);
  };
  const changeFilters = (value: PokemonFilters) => {
    firstVisibleIndex.current = 0;
    setStartIndex(undefined);
    onFiltersChange(value);
  };

  const caption = isFiltering
    ? filterCaption(filters, pokemon.length, collection, generation)
    : collection
    ? collectionCaption(collection, pokemon.length, isSearching, generation)
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
      collection={collection}
      onCollectionChange={changeCollection}
      shinyCount={shinyCount}
      shinyTotal={generation ? generationSize(generation) : LAST_POKEMON_ID}
      activeFilterCount={activeFilterCount}
      onOpenFilters={() => setFiltersOpen(true)}
      caption={caption}
      onOpenSettings={onOpenSettings}
      compact={compact}
    />
  );

  // Preferiti, shiny, ricerca e filtri vengono dall'indice locale: niente caricamento né errori di rete.
  const usesNetwork = !collection && !isSearching && !isFiltering;

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
          key={`${viewMode}-${generationId ?? 'all'}-${collection ?? 'all'}-${filters.types.join('+')}-${filters.category ?? 'all'}-${filters.sort}-${filters.reversed}`}
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
                <PokemonCard
                  pokemon={item.pokemon}
                  variant={viewMode}
                  onPress={onPressPokemon}
                  stat={
                    statSort
                      ? { label: SORT_LABELS[statSort], value: getIndexStat(item.pokemon.id, statSort) ?? 0 }
                      : undefined
                  }
                />
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
                message={`Nessun ${collection ? COLLECTION_TEXT[collection].one : 'Pokémon'} ${generation ? `di ${generation.region} ` : ''}si chiama "${searchText.trim()}".`}
                actionLabel="Cancella ricerca"
                actionStyle="ghost"
                onAction={() => onSearchTextChange('')}
              />
            ) : isFiltering ? (
              <ErrorState
                title="Nessun Pokémon con questi filtri"
                message={`Prova a togliere un tipo o la categoria${generation || collection ? ', o a cambiare generazione e raccolta' : ''}.`}
                actionLabel="Azzera filtri"
                actionStyle="ghost"
                onAction={() => changeFilters(DEFAULT_POKEMON_FILTERS)}
              />
            ) : collection ? (
              <ErrorState
                title={`${COLLECTION_TEXT[collection].none}${collectionCount === 0 ? '' : ` di ${generation?.region}`}`}
                message={COLLECTION_TEXT[collection].hint}
                glyph={COLLECTION_TEXT[collection].glyph}
                actionLabel="Mostra tutti i Pokémon"
                actionStyle="ghost"
                onAction={() => changeCollection(null)}
              />
            ) : null
          }
          refreshControl={
            !usesNetwork ? undefined : (
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
      {errorMessage && loadedCount > 0 && usesNetwork && (
        <ErrorToast
          message={errorMessage}
          actionLabel="Riprova"
          onAction={onRetry}
          bottomInset={insets.bottom}
        />
      )}
      <PokemonFilterSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onFiltersChange={changeFilters}
        generationId={generationId}
        onGenerationChange={changeGeneration}
        resultCount={matchCount}
      />
    </View>
  );
}

/** «12 Pokémon · Fuoco + Volante · Leggendari · per Velocità · Kanto». */
function filterCaption(
  filters: PokemonFilters,
  shown: number,
  collection: PokemonCollection | null,
  generation: Generation | undefined,
): string {
  const noun = collection === 'favorites' ? 'preferiti' : collection === 'shiny' ? 'shiny ottenuti' : 'Pokémon';
  const parts = [`${shown} ${noun}`];
  if (filters.types.length) parts.push(filters.types.map((t) => TYPE_NAMES_IT[t]).join(' + '));
  if (filters.category) parts.push(CATEGORY_LABELS[filters.category]);
  if (filters.sort !== 'number' || filters.reversed) {
    parts.push(`per ${SORT_LABELS[filters.sort]}${filters.reversed ? ' (inverso)' : ''}`);
  }
  if (generation) parts.push(generation.region);
  return parts.join(' · ');
}

const COLLECTION_TEXT: Record<PokemonCollection, { one: string; none: string; hint: string; glyph: string }> = {
  favorites: {
    one: 'preferito',
    none: 'Nessun preferito',
    hint: 'Apri la scheda di un Pokémon e tocca il cuore in alto per aggiungerlo ai preferiti.',
    glyph: '♡',
  },
  shiny: {
    one: 'shiny ottenuto',
    none: 'Nessuno shiny ottenuto',
    hint: "Apri la scheda di un Pokémon e tocca «Segna shiny ottenuto» sotto l'artwork.",
    glyph: '✦',
  },
};

function collectionCaption(
  collection: PokemonCollection,
  shown: number,
  isSearching: boolean,
  generation: Generation | undefined,
): string {
  const where = generation ? ` · ${generation.name} · ${generation.region}` : '';
  if (isSearching) {
    const among = collection === 'favorites' ? 'i preferiti' : 'gli shiny ottenuti';
    return `${shown} ${shown === 1 ? 'risultato' : 'risultati'} tra ${among}${where}`;
  }
  if (collection === 'shiny') return `${shown} ${shown === 1 ? 'shiny ottenuto' : 'shiny ottenuti'}${where}`;
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
