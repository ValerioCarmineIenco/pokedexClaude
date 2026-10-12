import { FlashList } from '@shopify/flash-list';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ViewMode } from '@/hooks/useViewMode';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import type { Item } from '@/types/item';

import { ErrorState } from '../ErrorState';
import { ErrorToast } from '../ErrorToast';
import { SearchBar } from '../SearchBar';
import { SectionTitle } from '../SectionTitle';
import { SkeletonBlock } from '../Skeleton';
import { ViewToggle } from '../ViewToggle';
import { ItemCard, ROW_ITEM_HEIGHT } from './ItemCard';

const COLUMNS = 3;
const GAP = 10;
const SIDE = 12;

export type ItemListViewProps = {
  items: Item[];
  /** Numero totale di oggetti (o di risultati della ricerca), se noto, per la didascalia. */
  totalCount?: number;
  /** Valore della barra di ricerca per nome. */
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
  onPressItem: (item: Item) => void;
};

export function ItemListView({
  items,
  totalCount,
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
  onPressItem,
}: ItemListViewProps) {
  const insets = useSafeAreaInsets();
  const isGrid = viewMode === 'grid';
  const count = totalCount ?? items.length;
  const isSearching = searchText.trim().length > 0;

  const header = (compact = false) => (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <SectionTitle section="items" />
        {!compact && (
          <View style={styles.toggle}>
            <ViewToggle value={viewMode} onChange={onViewModeChange} />
          </View>
        )}
      </View>
      {!compact && (
        <>
          <SearchBar
            value={searchText}
            onChangeText={onSearchTextChange}
            accessibilityLabel="Cerca un oggetto per nome"
          />
          <Text style={styles.caption}>
            {isSearching
              ? `${count} ${count === 1 ? 'risultato' : 'risultati'}`
              : `${count} ${count === 1 ? 'oggetto' : 'oggetti'}`}
          </Text>
        </>
      )}
    </View>
  );

  if (errorMessage && items.length === 0) {
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

  const skeletons = (n: number) => (
    <View style={[styles.skeletons, isGrid && styles.skeletonsGrid]}>
      {Array.from({ length: n }, (_, i) =>
        isGrid ? (
          <View key={i} style={styles.skeletonGridCell}>
            <View style={styles.skeletonSquare}>
              <SkeletonBlock width="100%" height={0} radius={16} style={styles.skeletonFill} />
            </View>
            <SkeletonBlock width="60%" height={11} style={styles.skeletonName} />
          </View>
        ) : (
          <View key={i} style={[styles.rowCell, styles.skeletonRow]}>
            <SkeletonBlock width={60} height={60} radius={16} />
            <View style={styles.skeletonRowText}>
              <SkeletonBlock width="45%" height={13} />
              <SkeletonBlock width="85%" height={10} />
            </View>
          </View>
        ),
      )}
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {header()}
      {isLoading ? (
        skeletons(isGrid ? 12 : 8)
      ) : (
        <FlashList
          key={viewMode}
          data={items}
          numColumns={isGrid ? COLUMNS : 1}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={isGrid ? styles.gridCell : styles.rowCell}>
              <ItemCard item={item} variant={viewMode} onPress={onPressItem} />
            </View>
          )}
          contentContainerStyle={{
            paddingHorizontal: isGrid ? SIDE - GAP / 2 : SIDE,
            paddingTop: 2,
            paddingBottom: insets.bottom + 24,
          }}
          onEndReached={hasNextPage ? onEndReached : undefined}
          onEndReachedThreshold={0.6}
          ListFooterComponent={isFetchingNextPage ? skeletons(isGrid ? COLUMNS : 2) : null}
          ListEmptyComponent={
            isSearching ? (
              <ErrorState
                title="Nessun risultato"
                message={`Nessun oggetto si chiama "${searchText.trim()}".`}
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
      {errorMessage && items.length > 0 && (
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
  },
  toggle: {
    marginLeft: 'auto',
  },
  caption: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.2,
    color: colors.textSubtle,
  },
  gridCell: {
    flex: 1,
    paddingHorizontal: GAP / 2,
    paddingBottom: 14,
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
  skeletonGridCell: {
    width: `${100 / COLUMNS}%`,
    paddingHorizontal: GAP / 2,
    paddingBottom: 14,
    alignItems: 'center',
    gap: 6,
  },
  skeletonSquare: {
    width: '100%',
    aspectRatio: 1,
  },
  skeletonFill: {
    position: 'absolute',
    height: '100%',
  },
  skeletonName: {
    marginTop: 2,
  },
  skeletonRow: {
    height: ROW_ITEM_HEIGHT,
    marginBottom: 8,
    paddingBottom: 0,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.skeleton,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skeletonRowText: {
    flex: 1,
    gap: 8,
  },
});
