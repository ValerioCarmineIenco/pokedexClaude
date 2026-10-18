import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ViewMode } from '@/hooks/useViewMode';
import type { PokemonCollection } from '@/types/pokemon';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { GenerationPicker } from './GenerationPicker';
import { Icon, type IconName } from './Icon';
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
  /** Mostra solo i preferiti o solo gli shiny ottenuti; null = tutti. */
  collection: PokemonCollection | null;
  onCollectionChange: (collection: PokemonCollection | null) => void;
  /** Shiny ottenuti tra i Pokémon della generazione mostrata (o di tutte), e quanti sono in tutto. */
  shinyCount: number;
  shinyTotal: number;
  /** Filtri avanzati attivi (tipi, categoria, ordinamento), per il pallino sul pulsante. */
  activeFilterCount: number;
  onOpenFilters: () => void;
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
  collection,
  onCollectionChange,
  shinyCount,
  shinyTotal,
  activeFilterCount,
  onOpenFilters,
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
              <CollectionButton
                icon={collection === 'favorites' ? 'heart' : 'heartOutline'}
                label="Solo preferiti"
                checked={collection === 'favorites'}
                onPress={() => onCollectionChange(collection === 'favorites' ? null : 'favorites')}
              />
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
          <View style={styles.searchRow}>
            <View style={styles.search}>
              <SearchBar value={searchText} onChangeText={onSearchTextChange} />
            </View>
            <Pressable
              onPress={onOpenFilters}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel={activeFilterCount > 0 ? `Filtri, ${activeFilterCount} attivi` : 'Filtri'}
              accessibilityHint="Apre tipi, categoria e ordinamento"
              style={({ pressed }) => [
                styles.iconButton,
                styles.filterButton,
                pressed && styles.pressed,
              ]}>
              <Icon name="filter" size={18} color={colors.textMuted} />
              {activeFilterCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeLabel}>{activeFilterCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
          <View style={styles.captionRow}>
            <Text style={styles.caption} numberOfLines={1}>
              {caption}
            </Text>
            <Pressable
              onPress={() => onCollectionChange(collection === 'shiny' ? null : 'shiny')}
              hitSlop={4}
              accessibilityRole="switch"
              accessibilityLabel={`Solo shiny ottenuti, ${shinyCount} su ${shinyTotal}`}
              accessibilityState={{ checked: collection === 'shiny' }}
              style={({ pressed }) => [
                styles.shinyChip,
                collection === 'shiny' && styles.shinyChipActive,
                pressed && styles.pressed,
              ]}>
              <Icon name="sparkles" size={14} color={colors.shinyText} />
              <Text style={styles.shinyCount}>
                {shinyCount}/{shinyTotal}
              </Text>
            </Pressable>
            <ViewToggle value={viewMode} onChange={onViewModeChange} />
          </View>
        </>
      )}
    </View>
  );
}

function CollectionButton({
  icon,
  label,
  checked,
  onPress,
}: {
  icon: IconName;
  label: string;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      style={({ pressed }) => [styles.iconButton, checked && styles.iconButtonActive, pressed && styles.pressed]}>
      <Icon name={icon} size={18} color={checked ? colors.surface : colors.textMuted} />
    </Pressable>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  search: {
    flex: 1,
  },
  filterButton: {
    width: 44,
    height: 44,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: {
    fontFamily: fonts.monoBold,
    fontSize: 11,
    color: colors.surface,
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
  shinyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: colors.shiny,
  },
  shinyChipActive: {
    borderColor: colors.shinyText,
  },
  shinyCount: {
    fontFamily: fonts.monoBold,
    fontSize: 12,
    color: colors.shinyText,
  },
  caption: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.2,
    color: colors.textSubtle,
  },
});
