import { FlashList } from '@shopify/flash-list';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ViewMode } from '@/hooks/useViewMode';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import type { Item } from '@/types/item';

import { ErrorState } from '../ErrorState';
import { ErrorToast } from '../ErrorToast';
import { Icon } from '../Icon';
import { PokeBallLogo } from '../PokeBallLogo';
import { SkeletonBlock } from '../Skeleton';
import { ViewToggle } from '../ViewToggle';
import { ItemCard, ROW_ITEM_HEIGHT } from './ItemCard';

const COLUMNS = 3;
const GAP = 10;
const SIDE = 12;

export type ItemListViewProps = {
  items: Item[];
  /** Numero totale di oggetti, se noto, per la didascalia. */
  totalCount?: number;
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
  /** Tocco sul titolo: apre il menu delle sezioni. */
  onPressTitle?: () => void;
};

export function ItemListView({
  items,
  totalCount,
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
  onPressTitle,
}: ItemListViewProps) {
  const insets = useSafeAreaInsets();
  const isGrid = viewMode === 'grid';
  const count = totalCount ?? items.length;

  const header = (compact = false) => (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Pressable
          onPress={onPressTitle}
          disabled={!onPressTitle}
          accessibilityRole={onPressTitle ? 'button' : 'header'}
          accessibilityLabel={onPressTitle ? 'Oggetti, cambia sezione' : 'Oggetti'}
          style={({ pressed }) => [styles.titleButton, pressed && styles.titlePressed]}>
          <PokeBallLogo />
          <Text style={styles.title}>Oggetti</Text>
          {onPressTitle && <Icon name="expand" size={16} color={colors.textSubtle} />}
        </Pressable>
        {!compact && (
          <View style={styles.toggle}>
            <ViewToggle value={viewMode} onChange={onViewModeChange} />
          </View>
        )}
      </View>
      {!compact && (
        <Text style={styles.caption}>
          {count} {count === 1 ? 'oggetto' : 'oggetti'}
        </Text>
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
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
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
  titleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titlePressed: {
    opacity: 0.7,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    letterSpacing: -0.6,
    color: colors.text,
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
