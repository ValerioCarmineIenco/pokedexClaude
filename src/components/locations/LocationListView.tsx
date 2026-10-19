import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { LocationRegion, LocationSummary } from '@/types/location';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

import { ErrorState } from '../ErrorState';
import { Icon } from '../Icon';
import { SearchBar } from '../SearchBar';
import { SectionTitle } from '../SectionTitle';
import { LocationCard } from './LocationCard';
import { RegionChips } from './RegionChips';

const SIDE = 12;

export type LocationListViewProps = {
  locations: LocationSummary[];
  regions: LocationRegion[];
  /** Slug della regione scelta; null = tutte. */
  region: string | null;
  onRegionChange: (region: string | null) => void;
  /** Valore della barra di ricerca per nome. */
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onOpenSettings: () => void;
  onLocationPress: (location: LocationSummary) => void;
};

/**
 * Elenco delle località: ricerca per nome, regioni scorrevoli e una scheda per località con
 * il numero di Pokémon e di giochi. I dati vengono dall'indice locale: niente caricamento.
 */
export function LocationListView({
  locations,
  regions,
  region,
  onRegionChange,
  searchText,
  onSearchTextChange,
  onOpenSettings,
  onLocationPress,
}: LocationListViewProps) {
  const { t } = useTranslation('locations');
  const insets = useSafeAreaInsets();
  const { ref: scrollRef, onScroll } = useScrollRestoration();
  const query = searchText.trim();
  const isSearching = query.length > 0;
  const count = locations.length;
  const caption = isSearching ? t('list.results', { count }) : t('list.count', { count });
  const regionLabel = regions.find((r) => r.name === region)?.label;

  const emptyMessage = isSearching
    ? regionLabel
      ? t('list.emptySearchInRegion', { region: regionLabel, query })
      : t('list.emptySearch', { query })
    : regionLabel
      ? t('list.emptyInRegion', { region: regionLabel })
      : t('list.empty');

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <SectionTitle section="locations" />
          <Pressable
            onPress={onOpenSettings}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={t('screens.settings', { ns: 'common' })}
            style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}>
            <Icon name="settings" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
        <SearchBar
          value={searchText}
          onChangeText={onSearchTextChange}
          accessibilityLabel={t('list.searchLabel')}
        />
        <RegionChips regions={regions} value={region} onChange={onRegionChange} />
        <Text style={styles.caption} numberOfLines={1}>
          {caption}
        </Text>
      </View>
      <FlashList
        ref={scrollRef}
        onScroll={onScroll}
        data={locations}
        keyExtractor={(location) => String(location.id)}
        renderItem={({ item: location }) => (
          <View style={styles.rowCell}>
            <LocationCard location={location} showRegion={region === null} onPress={onLocationPress} />
          </View>
        )}
        contentContainerStyle={{
          paddingHorizontal: SIDE,
          paddingTop: 2,
          paddingBottom: insets.bottom + 24,
        }}
        ListEmptyComponent={
          <ErrorState
            title={t('list.noResults')}
            message={emptyMessage}
            actionLabel={isSearching ? t('list.clearSearch') : undefined}
            actionStyle="ghost"
            onAction={isSearching ? () => onSearchTextChange('') : undefined}
          />
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
    justifyContent: 'space-between',
    gap: 10,
    minHeight: 40,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
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
});
