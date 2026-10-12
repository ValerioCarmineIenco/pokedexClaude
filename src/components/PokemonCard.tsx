import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/theme/fonts';
import { primaryType, typeTint } from '@/theme/typeColors';
import { TYPE_NAMES_IT } from '@/theme/typeNames';
import type { ViewMode } from '@/hooks/useViewMode';
import type { PokemonSummary } from '@/types/pokemon';
import { formatName, formatNumber } from '@/utils/format';

import { PokeBallMark } from './PokeBallMark';
import { TypeBadge } from './TypeBadge';

export const GRID_CARD_HEIGHT = 128;
export const ROW_CARD_HEIGHT = 72;

type Props = {
  pokemon: PokemonSummary;
  variant: ViewMode;
  onPress: (pokemon: PokemonSummary) => void;
};

export function accessibilityLabelFor(pokemon: PokemonSummary): string {
  const types = pokemon.types.map((t) => TYPE_NAMES_IT[t]).join(' e ');
  return `${formatName(pokemon.name)}, numero ${pokemon.id}, tipo ${types}`;
}

export function PokemonCard({ pokemon, variant, onPress }: Props) {
  const background = typeTint(primaryType(pokemon.types));
  const isGrid = variant === 'grid';

  return (
    <Pressable
      onPress={() => onPress(pokemon)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabelFor(pokemon)}
      style={({ pressed }) => [
        isGrid ? styles.grid : styles.row,
        { backgroundColor: background },
        pressed && styles.pressed,
      ]}>
      {isGrid ? (
        <>
          <PokeBallMark size={104} thickness={14} style={styles.gridMark} />
          <View>
            <Text style={styles.number}>{formatNumber(pokemon.id)}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {formatName(pokemon.name)}
            </Text>
          </View>
          <View style={styles.gridTypes}>
            {pokemon.types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </View>
          <Image
            source={pokemon.artworkUrl}
            style={styles.gridArt}
            contentFit="contain"
            transition={150}
            recyclingKey={String(pokemon.id)}
          />
        </>
      ) : (
        <>
          <PokeBallMark size={88} thickness={12} style={styles.rowMark} />
          <Image
            source={pokemon.artworkUrl}
            style={styles.rowArt}
            contentFit="contain"
            transition={150}
            recyclingKey={String(pokemon.id)}
          />
          <View style={styles.rowText}>
            <Text style={styles.number}>{formatNumber(pokemon.id)}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {formatName(pokemon.name)}
            </Text>
          </View>
          <View style={styles.rowTypes}>
            {pokemon.types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    height: GRID_CARD_HEIGHT,
    borderRadius: 16,
    padding: 12,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  row: {
    height: ROW_CARD_HEIGHT,
    borderRadius: 16,
    paddingLeft: 8,
    paddingRight: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  gridMark: {
    right: -24,
    bottom: -24,
  },
  rowMark: {
    right: -20,
    top: -16,
  },
  number: {
    fontFamily: fonts.monoBold,
    fontSize: 11,
    color: 'rgba(29, 28, 34, 0.6)',
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: '#1D1C22',
  },
  gridTypes: {
    gap: 4,
    alignItems: 'flex-start',
  },
  gridArt: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 72,
    height: 72,
  },
  rowArt: {
    width: 58,
    height: 58,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTypes: {
    gap: 4,
    alignItems: 'flex-end',
  },
});
