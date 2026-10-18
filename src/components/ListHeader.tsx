import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ViewMode } from '@/hooks/useViewMode';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { GenerationPicker } from './GenerationPicker';
import { Icon } from './Icon';
import { SearchBar } from './SearchBar';
import { SectionTitle } from './SectionTitle';
import { ViewToggle } from './ViewToggle';

type Props = {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  /** Generazione mostrata; null = tutte. */
  generationId: number | null;
  onGenerationChange: (generationId: number | null) => void;
  /** Mostra solo i Pokémon preferiti. */
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (favoritesOnly: boolean) => void;
  caption: string;
  onOpenSettings: () => void;
  /** Nasconde ricerca e selettori, ad esempio nello stato di errore. */
  compact?: boolean;
};

export function ListHeader({
  searchText,
  onSearchTextChange,
  viewMode,
  onViewModeChange,
  generationId,
  onGenerationChange,
  favoritesOnly,
  onFavoritesOnlyChange,
  caption,
  onOpenSettings,
  compact = false,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <SectionTitle section="pokedex" />
        <View style={styles.actions}>
          {!compact && (
            <>
              <GenerationPicker value={generationId} onChange={onGenerationChange} />
              <Pressable
                onPress={() => onFavoritesOnlyChange(!favoritesOnly)}
                hitSlop={4}
                accessibilityRole="switch"
                accessibilityLabel="Solo preferiti"
                accessibilityState={{ checked: favoritesOnly }}
                style={({ pressed }) => [
                  styles.iconButton,
                  favoritesOnly && styles.iconButtonActive,
                  pressed && styles.pressed,
                ]}>
                <Icon
                  name={favoritesOnly ? 'heart' : 'heartOutline'}
                  size={18}
                  color={favoritesOnly ? colors.surface : colors.textMuted}
                />
              </Pressable>
            </>
          )}
          <Pressable
            onPress={onOpenSettings}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel="Impostazioni"
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <Icon name="settings" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>
      {!compact && (
        <>
          <SearchBar value={searchText} onChangeText={onSearchTextChange} />
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: colors.accent,
  },
  pressed: {
    opacity: 0.7,
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
});
