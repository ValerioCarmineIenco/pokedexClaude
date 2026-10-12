import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ViewMode } from '@/hooks/useViewMode';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import type { Item } from '@/types/item';

import { getCategoryColors } from './itemFallback';

export const ROW_ITEM_HEIGHT = 84;
const ROW_TILE = 60;

type Props = {
  item: Item;
  variant: ViewMode;
  onPress: (item: Item) => void;
};

/** Riquadro quadrato con l'immagine dell'oggetto, tinto secondo la categoria. */
function ItemTile({ item, size }: { item: Item; size?: number }) {
  const { soft } = getCategoryColors(item.category);
  return (
    <View
      style={[
        styles.tile,
        { backgroundColor: soft },
        size ? { width: size, height: size } : styles.tileFill,
      ]}>
      <Image
        source={item.imageUrl}
        style={styles.image}
        contentFit="contain"
        transition={150}
        recyclingKey={String(item.id)}
      />
    </View>
  );
}

/** Oggetto dell'elenco. Griglia: riquadro quadrato e nome. Riga: immagine, nome e descrizione. */
export function ItemCard({ item, variant, onPress }: Props) {
  const isGrid = variant === 'grid';
  const { color: accent } = getCategoryColors(item.category);

  return (
    <Pressable
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={isGrid || !item.description ? item.name : `${item.name}. ${item.description}`}
      style={({ pressed }) => [isGrid ? styles.grid : styles.row, pressed && styles.pressed]}>
      {isGrid ? (
        <>
          <ItemTile item={item} />
          <Text style={styles.gridName} numberOfLines={2}>
            {item.name}
          </Text>
        </>
      ) : (
        <>
          <ItemTile item={item} size={ROW_TILE} />
          <View style={styles.rowText}>
            <Text style={styles.rowName} numberOfLines={1}>
              {item.name}
            </Text>
            {!!item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
          <View style={[styles.dot, { backgroundColor: accent }]} />
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 6,
  },
  row: {
    height: ROW_ITEM_HEIGHT,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  tile: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tileFill: {
    width: '100%',
    aspectRatio: 1,
  },
  image: {
    width: '62%',
    height: '62%',
  },
  gridName: {
    fontFamily: fonts.display,
    fontSize: 13,
    lineHeight: 16,
    color: colors.text,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowName: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.text,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 17,
    color: colors.textMuted,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
