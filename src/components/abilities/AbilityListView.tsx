import { FlashList } from '@shopify/flash-list';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ViewMode } from '@/hooks/useViewMode';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { ErrorState } from '../ErrorState';
import { ErrorToast } from '../ErrorToast';
import { SearchBar } from '../SearchBar';
import { SectionTitle } from '../SectionTitle';
import { SkeletonBlock } from '../Skeleton';
import { ViewToggle } from '../ViewToggle';
import {
  AbilityCard,
  GRID_ABILITY_HEIGHT,
  ROW_ABILITY_HEIGHT,
  type AbilityListEntry,
} from './AbilityCard';

const COLUMNS = 2;
const GAP = 10;
const SIDE = 12;

const countLabel = (n: number) => `${n} abilità`;

export type AbilityListViewProps = {
  abilities: AbilityListEntry[];
  /** Numero totale di abilità (o di risultati della ricerca), se noto, per la didascalia. */
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
  onPressAbility: (ability: AbilityListEntry) => void;
};

/** Elenco delle abilità: stessa struttura della lista oggetti, senza selettore di categoria. */
export function AbilityListView({
  abilities,
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
  onPressAbility,
}: AbilityListViewProps) {
  const insets = useSafeAreaInsets();
  const isGrid = viewMode === 'grid';
  const count = totalCount ?? abilities.length;
  const isSearching = searchText.trim().length > 0;
  const caption = isSearching
    ? `${count} ${count === 1 ? 'risultato' : 'risultati'}`
    : countLabel(count);

  const header = (compact = false) => (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <SectionTitle section="abilities" />
      </View>
      {!compact && (
        <>
          <SearchBar
            value={searchText}
            onChangeText={onSearchTextChange}
            accessibilityLabel="Cerca un'abilità per nome"
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

  if (errorMessage && abilities.length === 0) {
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
            <View style={styles.skeletonCard}>
              <SkeletonBlock width={32} height={32} radius={12} />
              <SkeletonBlock width="60%" height={13} />
              <SkeletonBlock width="90%" height={10} />
              <SkeletonBlock width="75%" height={10} />
            </View>
          </View>
        ) : (
          <View key={i} style={styles.skeletonRow}>
            <SkeletonBlock width={44} height={44} radius={12} />
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
        skeletons(8)
      ) : (
        <FlashList
          key={viewMode}
          data={abilities}
          numColumns={isGrid ? COLUMNS : 1}
          keyExtractor={(ability) => String(ability.id)}
          renderItem={({ item: ability }) => (
            <View style={isGrid ? styles.gridCell : styles.rowCell}>
              <AbilityCard ability={ability} variant={viewMode} onPress={onPressAbility} />
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
                message={`Nessuna abilità si chiama "${searchText.trim()}".`}
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
      {errorMessage && abilities.length > 0 && (
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
  skeletonGridCell: {
    width: `${100 / COLUMNS}%`,
    paddingHorizontal: GAP / 2,
    paddingBottom: GAP,
  },
  skeletonCard: {
    height: GRID_ABILITY_HEIGHT,
    borderRadius: 16,
    backgroundColor: colors.skeleton,
    padding: 12,
    gap: 8,
  },
  skeletonRow: {
    height: ROW_ABILITY_HEIGHT,
    marginBottom: 8,
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
