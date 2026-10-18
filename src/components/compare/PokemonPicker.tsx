import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FIRST_POKEMON_ID, getPokemonSummaries, LAST_POKEMON_ID } from '@/api/pokemon';
import { usePokemonSearch } from '@/hooks/usePokemonSearch';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import type { PokemonSummary } from '@/types/pokemon';

import { ErrorState } from '../ErrorState';
import { Icon } from '../Icon';
import { PokemonCard, ROW_CARD_HEIGHT } from '../PokemonCard';
import { SearchBar } from '../SearchBar';

const ROW_GAP = 8;

/** Tutto il Pokédex, letto dall'indice statico: si mostra finché non si scrive un nome. */
const ALL_POKEMON = getPokemonSummaries(
  Array.from({ length: LAST_POKEMON_ID - FIRST_POKEMON_ID + 1 }, (_, i) => FIRST_POKEMON_ID + i),
);

type Props = {
  title: string;
  onPick: (pokemon: PokemonSummary) => void;
  onClose: () => void;
  /** Pokémon da non proporre, ad esempio quelli già in squadra. */
  excludeIds?: ReadonlySet<number>;
};

/** Scelta di un Pokémon da confrontare: ricerca per nome su tutto il Pokédex, senza rete. */
export function PokemonPicker({ title, onPick, onClose, excludeIds }: Props) {
  const { t } = useTranslation('compare');
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const results = usePokemonSearch(searchText);
  const found = searchText.trim() ? results : ALL_POKEMON;
  const pokemon = excludeIds?.size ? found.filter((entry) => !excludeIds.has(entry.id)) : found;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={onClose}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
          <Icon name="back" size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
      </View>
      <View style={styles.search}>
        <SearchBar value={searchText} onChangeText={setSearchText} />
      </View>
      <FlatList
        data={pokemon}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <PokemonCard pokemon={item} variant="row" onPress={onPick} />}
        ItemSeparatorComponent={Separator}
        getItemLayout={(_, index) => ({
          length: ROW_CARD_HEIGHT + ROW_GAP,
          offset: (ROW_CARD_HEIGHT + ROW_GAP) * index,
          index,
        })}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
        ListEmptyComponent={
          <ErrorState
            title={t('picker.emptyTitle')}
            message={t('picker.emptyMessage', { query: searchText.trim() })}
            actionLabel={t('picker.clearSearch')}
            actionStyle="ghost"
            onAction={() => setSearchText('')}
          />
        }
      />
    </View>
  );
}

function Separator() {
  return <View style={{ height: ROW_GAP }} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 52,
    paddingHorizontal: 12,
  },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.field,
  },
  title: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  search: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  list: {
    paddingHorizontal: 16,
  },
});
