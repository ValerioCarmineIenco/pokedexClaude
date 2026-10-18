import { FlashList } from '@shopify/flash-list';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getItemIndex } from '@/api/items';
import type { ViewMode } from '@/hooks/useViewMode';
import { CATEGORY_COLORS } from '@/theme/categoryColors';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { ITEM_CATEGORIES, ITEM_CATEGORY_LABELS, type Item, type ItemCategory } from '@/types/item';

import { ErrorState } from '../ErrorState';
import { ErrorToast } from '../ErrorToast';
import { ListSectionHeader } from '../ListSectionHeader';
import { SearchBar } from '../SearchBar';
import { SectionTitle } from '../SectionTitle';
import { SkeletonBlock } from '../Skeleton';
import { ViewToggle } from '../ViewToggle';
import { CategoryPicker } from './CategoryPicker';
import { ItemCard, ROW_ITEM_HEIGHT } from './ItemCard';

const COLUMNS = 3;
const GAP = 10;
const SIDE = 12;

/** Elementi dell'elenco: gli oggetti e, con tutte le categorie, un'intestazione per ciascuna. */
type ListItem =
  | { kind: 'item'; item: Item }
  | { kind: 'category'; category: ItemCategory; isFirst: boolean };

function buildItems(items: Item[], withHeaders: boolean): ListItem[] {
  const list: ListItem[] = [];
  let current: ItemCategory | null = null;
  for (const item of items) {
    if (withHeaders && item.category !== current) {
      list.push({ kind: 'category', category: item.category, isFirst: current === null });
      current = item.category;
    }
    list.push({ kind: 'item', item });
  }
  return list;
}

export type ItemListViewProps = {
  items: Item[];
  /** Numero totale di oggetti (o di risultati della ricerca), se noto, per la didascalia. */
  totalCount?: number;
  /** Valore della barra di ricerca per nome. */
  searchText: string;
  onSearchTextChange: (text: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  /** Categoria mostrata; null = tutte in sequenza, con un'intestazione per ciascuna. */
  category: ItemCategory | null;
  onCategoryChange: (category: ItemCategory | null) => void;
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
  category,
  onCategoryChange,
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
  const { t } = useTranslation('items');
  const insets = useSafeAreaInsets();
  const countLabel = (n: number) => t('list.count', { count: n });
  const isGrid = viewMode === 'grid';
  const count = totalCount ?? items.length;
  const isSearching = searchText.trim().length > 0;

  const listItems = useMemo(() => buildItems(items, category == null), [items, category]);
  const caption = isSearching
    ? [t('list.results', { count }), category && ITEM_CATEGORY_LABELS[category]].filter(Boolean).join(' · ')
    : `${countLabel(count)} · ${
        category ? ITEM_CATEGORY_LABELS[category] : t('list.categoryCount', { count: ITEM_CATEGORIES.length })
      }`;

  const header = (compact = false) => (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <SectionTitle section="items" />
        {!compact && (
          <View style={styles.actions}>
            <CategoryPicker value={category} onChange={onCategoryChange} />
          </View>
        )}
      </View>
      {!compact && (
        <>
          <SearchBar
            value={searchText}
            onChangeText={onSearchTextChange}
            accessibilityLabel={t('list.searchLabel')}
          />
          <View style={styles.captionRow}>
            <Text style={styles.caption} numberOfLines={1}>
              {caption}
            </Text>
            <ViewToggle value={viewMode} onChange={onViewModeChange} />
          </View>
        </>
      )}
    </View>
  );

  if (errorMessage && items.length === 0) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {header(true)}
        <ErrorState
          title={t('errors.offlineTitle')}
          message={errorMessage}
          actionLabel={t('errors.retry')}
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
          key={`${viewMode}-${category ?? 'all'}`}
          data={listItems}
          numColumns={isGrid ? COLUMNS : 1}
          keyExtractor={(entry) =>
            entry.kind === 'item' ? String(entry.item.id) : `category-${entry.category}`
          }
          getItemType={(entry) => entry.kind}
          overrideItemLayout={(layout, entry, _index, maxColumns) => {
            if (entry.kind === 'category') layout.span = maxColumns;
          }}
          renderItem={({ item: entry }) =>
            entry.kind === 'category' ? (
              <ListSectionHeader
                title={ITEM_CATEGORY_LABELS[entry.category]}
                meta={countLabel(getItemIndex(entry.category, searchText).length)}
                swatch={CATEGORY_COLORS[entry.category]}
                isFirst={entry.isFirst}
                inset={isGrid ? GAP / 2 : 0}
              />
            ) : (
              <View style={isGrid ? styles.gridCell : styles.rowCell}>
                <ItemCard item={entry.item} variant={viewMode} onPress={onPressItem} />
              </View>
            )
          }
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
                title={t('list.noResultsTitle')}
                message={
                  category
                    ? t('list.noResultsInCategory', {
                        category: ITEM_CATEGORY_LABELS[category],
                        query: searchText.trim(),
                      })
                    : t('list.noResults', { query: searchText.trim() })
                }
                actionLabel={t('list.clearSearch')}
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
          actionLabel={t('errors.retry')}
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
  actions: {
    marginLeft: 'auto',
  },
  captionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  caption: {
    flex: 1,
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
