import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ViewMode } from '@/hooks/useViewMode';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import type { MoveSummary } from '@/types/move';

import { ErrorState } from '../ErrorState';
import { SearchBar } from '../SearchBar';
import { SectionTitle } from '../SectionTitle';
import { ViewToggle } from '../ViewToggle';
import { MoveCard } from './MoveCard';

const COLUMNS = 2;
const GAP = 10;
const SIDE = 12;

export type MoveListViewProps = {
  moves: MoveSummary[];
  /** Numero di mosse (o di risultati della ricerca), per la didascalia. */
  totalCount?: number;
  /** Valore della barra di ricerca per nome. */
  searchText: string;
  onSearchTextChange: (text: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onPressMove: (move: MoveSummary) => void;
};

/**
 * Elenco delle mosse: stessa struttura della lista abilità. I dati sono nell'indice locale,
 * quindi niente caricamento, errori di rete o pagine successive.
 */
export function MoveListView({
  moves,
  totalCount,
  searchText,
  onSearchTextChange,
  viewMode,
  onViewModeChange,
  onPressMove,
}: MoveListViewProps) {
  const { t } = useTranslation('moves');
  const insets = useSafeAreaInsets();
  const isGrid = viewMode === 'grid';
  const count = totalCount ?? moves.length;
  const isSearching = searchText.trim().length > 0;
  const caption = isSearching ? t('list.results', { count }) : t('count', { count });

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <SectionTitle section="moves" />
        </View>
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
      </View>
      <FlashList
        key={viewMode}
        data={moves}
        numColumns={isGrid ? COLUMNS : 1}
        keyExtractor={(move) => String(move.id)}
        renderItem={({ item: move }) => (
          <View style={isGrid ? styles.gridCell : styles.rowCell}>
            <MoveCard move={move} variant={viewMode} onPress={onPressMove} />
          </View>
        )}
        contentContainerStyle={{
          paddingHorizontal: isGrid ? SIDE - GAP / 2 : SIDE,
          paddingTop: 2,
          paddingBottom: insets.bottom + 24,
        }}
        ListEmptyComponent={
          isSearching ? (
            <ErrorState
              title={t('list.noResultsTitle')}
              message={t('list.noResultsMessage', { query: searchText.trim() })}
              actionLabel={t('list.clearSearch')}
              actionStyle="ghost"
              onAction={() => onSearchTextChange('')}
            />
          ) : null
        }
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />
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
});
