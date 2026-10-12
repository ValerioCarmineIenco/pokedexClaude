import { StyleSheet, Text, View } from 'react-native';

import type { ViewMode } from '@/hooks/useViewMode';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { PokeBallLogo } from './PokeBallLogo';
import { SearchBar } from './SearchBar';
import { ViewToggle } from './ViewToggle';

type Props = {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  caption: string;
  /** Nasconde ricerca e selettore, ad esempio nello stato di errore. */
  compact?: boolean;
};

export function ListHeader({
  searchText,
  onSearchTextChange,
  viewMode,
  onViewModeChange,
  caption,
  compact = false,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <PokeBallLogo />
        <Text style={styles.title} accessibilityRole="header">
          Pokédex
        </Text>
        {!compact && (
          <View style={styles.toggle}>
            <ViewToggle value={viewMode} onChange={onViewModeChange} />
          </View>
        )}
      </View>
      {!compact && (
        <>
          <SearchBar value={searchText} onChangeText={onSearchTextChange} />
          <Text style={styles.caption}>{caption}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 40,
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
});
