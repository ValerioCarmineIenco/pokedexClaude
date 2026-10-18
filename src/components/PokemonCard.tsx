import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { getArtworkUrl } from '@/api/pokemon';
import { t } from '@/i18n';
import { pokemonName } from '@/i18n/names';
import { useArtworkStyle } from '@/hooks/useArtworkStyle';
import { fonts } from '@/theme/fonts';
import { primaryType, typeTint } from '@/theme/typeColors';
import { TYPE_LABELS } from '@/theme/typeNames';
import type { ViewMode } from '@/hooks/useViewMode';
import type { PokemonSummary } from '@/types/pokemon';
import { formatNumber } from '@/utils/format';

import { PokeBallMark } from './PokeBallMark';
import { TypeBadge } from './TypeBadge';

export const GRID_CARD_HEIGHT = 128;
export const ROW_CARD_HEIGHT = 72;

type Props = {
  pokemon: PokemonSummary;
  variant: ViewMode;
  onPress: (pokemon: PokemonSummary) => void;
  /** Statistica usata per ordinare l'elenco, mostrata sulla card (es. Velocità 160). */
  stat?: { label: string; value: number };
};

export function accessibilityLabelFor(pokemon: PokemonSummary): string {
  const [type1, type2] = pokemon.types.map((type) => TYPE_LABELS[type]);
  const name = pokemonName(pokemon.id, pokemon.name);
  return type2
    ? t('pokedex:card.accessibilityLabelTwoTypes', { name, number: pokemon.id, type1, type2 })
    : t('pokedex:card.accessibilityLabelOneType', { name, number: pokemon.id, type: type1 });
}

export function PokemonCard({ pokemon, variant, onPress, stat }: Props) {
  const background = typeTint(primaryType(pokemon.types));
  const isGrid = variant === 'grid';
  const [artworkStyle] = useArtworkStyle();
  const artworkUrl = getArtworkUrl(pokemon.id, artworkStyle);
  const name = pokemonName(pokemon.id, pokemon.name);

  return (
    <Pressable
      onPress={() => onPress(pokemon)}
      accessibilityRole="button"
      accessibilityLabel={
        stat ? `${accessibilityLabelFor(pokemon)}, ${stat.label} ${stat.value}` : accessibilityLabelFor(pokemon)
      }
      style={({ pressed }) => [
        isGrid ? styles.grid : styles.row,
        { backgroundColor: background },
        pressed && styles.pressed,
      ]}>
      {isGrid ? (
        <>
          <PokeBallMark size={104} thickness={14} style={styles.gridMark} />
          {stat && <StatPill stat={stat} style={styles.gridStat} />}
          <View>
            <Text style={styles.number}>{formatNumber(pokemon.id)}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
          </View>
          <View style={styles.gridTypes}>
            {pokemon.types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </View>
          <Image
            source={artworkUrl}
            style={styles.gridArt}
            contentFit="contain"
            transition={150}
            recyclingKey={artworkUrl}
          />
        </>
      ) : (
        <>
          <PokeBallMark size={88} thickness={12} style={styles.rowMark} />
          <Image
            source={artworkUrl}
            style={styles.rowArt}
            contentFit="contain"
            transition={150}
            recyclingKey={artworkUrl}
          />
          <View style={styles.rowText}>
            <Text style={styles.number}>{formatNumber(pokemon.id)}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
          </View>
          {stat && <StatPill stat={stat} />}
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

function StatPill({ stat, style }: { stat: { label: string; value: number }; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.stat, style]}>
      <Text style={styles.statLabel}>{stat.label}</Text>
      <Text style={styles.statValue}>{stat.value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: {
    alignItems: 'center',
    minWidth: 44,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  gridStat: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  statLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: 'rgba(29, 28, 34, 0.6)',
  },
  statValue: {
    fontFamily: fonts.monoBold,
    fontSize: 13,
    color: '#1D1C22',
  },
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
