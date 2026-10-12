import { StyleSheet, Text, View } from 'react-native';

import type { ViewMode } from '@/hooks/useViewMode';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { GenerationPicker } from './GenerationPicker';
import { PokeBallLogo } from './PokeBallLogo';
import { SearchBar } from './SearchBar';
import { ViewToggle } from './ViewToggle';

type Props = {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  /** Generazione mostrata; null = tutte. */
  generationId: number | null;
  onGenerationChange: (generationId: number | null) => void;
  caption: string;
  /** Nasconde ricerca e selettore, ad esempio nello stato di errore. */
  compact?: boolean;
};

export function ListHeader({
  searchText,
  onSearchTextChange,
  viewMode,
  onViewModeChange,
  generationId,
  onGenerationChange,
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
          <View style={styles.actions}>
            <GenerationPicker value={generationId} onChange={onGenerationChange} />
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
  actions: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  caption: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.2,
    color: colors.textSubtle,
  },
});
