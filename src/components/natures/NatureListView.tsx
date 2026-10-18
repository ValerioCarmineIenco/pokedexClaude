import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Nature } from '@/types/nature';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { ErrorState } from '../ErrorState';
import { ErrorToast } from '../ErrorToast';
import { SearchBar } from '../SearchBar';
import { SectionTitle } from '../SectionTitle';
import { SkeletonBlock } from '../Skeleton';
import { NATURE_CARD_HEIGHT, NatureCard } from './NatureCard';

const SIDE = 12;

export type NatureListViewProps = {
  natures: Nature[];
  /** Numero di nature (o di risultati della ricerca), noto anche prima del caricamento. */
  totalCount?: number;
  /** Valore della barra di ricerca per nome. */
  searchText: string;
  onSearchTextChange: (text: string) => void;
  /** Primo caricamento, nessun dato ancora. */
  isLoading: boolean;
  errorMessage: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onRetry: () => void;
};

/**
 * Elenco delle nature: stessa struttura delle liste di oggetti e abilità, ma solo a righe
 * (ogni scheda mostra già tutto, non c'è un dettaglio da aprire).
 */
export function NatureListView({
  natures,
  totalCount,
  searchText,
  onSearchTextChange,
  isLoading,
  errorMessage,
  isRefreshing,
  onRefresh,
  onRetry,
}: NatureListViewProps) {
  const { t } = useTranslation('natures');
  const insets = useSafeAreaInsets();
  const count = totalCount ?? natures.length;
  const isSearching = searchText.trim().length > 0;
  const caption = isSearching ? t('list.results', { count }) : t('list.count', { count });

  const header = (compact = false) => (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <SectionTitle section="natures" />
      </View>
      {!compact && (
        <>
          <SearchBar
            value={searchText}
            onChangeText={onSearchTextChange}
            accessibilityLabel={t('list.searchLabel')}
          />
          <Text style={styles.caption} numberOfLines={1}>
            {caption}
          </Text>
        </>
      )}
    </View>
  );

  if (errorMessage && natures.length === 0) {
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

  const skeletons = (
    <View style={styles.skeletons}>
      {Array.from({ length: 5 }, (_, i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonHeader}>
            <SkeletonBlock width={32} height={32} radius={10} />
            <SkeletonBlock width="40%" height={14} />
          </View>
          <View style={styles.skeletonFacts}>
            <SkeletonBlock width="38%" height={10} />
            <SkeletonBlock width="38%" height={10} />
          </View>
          <View style={styles.skeletonFacts}>
            <SkeletonBlock width="30%" height={10} />
            <SkeletonBlock width="30%" height={10} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {header()}
      {isLoading ? (
        skeletons
      ) : (
        <FlashList
          data={natures}
          keyExtractor={(nature) => String(nature.id)}
          renderItem={({ item: nature }) => (
            <View style={styles.rowCell}>
              <NatureCard nature={nature} />
            </View>
          )}
          contentContainerStyle={{
            paddingHorizontal: SIDE,
            paddingTop: 2,
            paddingBottom: insets.bottom + 24,
          }}
          ListEmptyComponent={
            isSearching ? (
              <ErrorState
                title={t('list.noResultsTitle')}
                message={t('list.noResults', { query: searchText.trim() })}
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
      {errorMessage && natures.length > 0 && (
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
  caption: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.2,
    color: colors.textSubtle,
  },
  rowCell: {
    paddingBottom: 8,
  },
  skeletons: {
    paddingHorizontal: SIDE,
  },
  skeletonCard: {
    height: NATURE_CARD_HEIGHT,
    marginBottom: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.skeleton,
    gap: 14,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  skeletonFacts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: '12%',
  },
});
