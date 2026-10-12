import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ViewMode } from '@/hooks/useViewMode';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { Icon } from './Icon';
import { SearchBar } from './SearchBar';
import { SectionTitle } from './SectionTitle';
import { ViewToggle } from './ViewToggle';

type Props = {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  caption: string;
  onOpenSettings: () => void;
  /** Nasconde ricerca e selettore, ad esempio nello stato di errore. */
  compact?: boolean;
};

export function ListHeader({
  searchText,
  onSearchTextChange,
  viewMode,
  onViewModeChange,
  caption,
  onOpenSettings,
  compact = false,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <SectionTitle section="pokedex" />
        <View style={styles.actions}>
          {!compact && <ViewToggle value={viewMode} onChange={onViewModeChange} />}
          <Pressable
            onPress={onOpenSettings}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel="Impostazioni"
            style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}>
            <Icon name="settings" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
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
  actions: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
});
