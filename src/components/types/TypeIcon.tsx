import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { TYPE_COLORS, typeTextColor } from '@/theme/typeColors';
import type { TypeName } from '@/types/pokemon';

/** Icone dei tipi (vedi assets/images/types/README.md): glifi bianchi, ricolorati con `tintColor`. */
const ICONS: Record<TypeName, number> = {
  normal: require('@/assets/images/types/normal.svg'),
  fire: require('@/assets/images/types/fire.svg'),
  water: require('@/assets/images/types/water.svg'),
  electric: require('@/assets/images/types/electric.svg'),
  grass: require('@/assets/images/types/grass.svg'),
  ice: require('@/assets/images/types/ice.svg'),
  fighting: require('@/assets/images/types/fighting.svg'),
  poison: require('@/assets/images/types/poison.svg'),
  ground: require('@/assets/images/types/ground.svg'),
  flying: require('@/assets/images/types/flying.svg'),
  psychic: require('@/assets/images/types/psychic.svg'),
  bug: require('@/assets/images/types/bug.svg'),
  rock: require('@/assets/images/types/rock.svg'),
  ghost: require('@/assets/images/types/ghost.svg'),
  dragon: require('@/assets/images/types/dragon.svg'),
  dark: require('@/assets/images/types/dark.svg'),
  steel: require('@/assets/images/types/steel.svg'),
  fairy: require('@/assets/images/types/fairy.svg'),
};

type Props = {
  type: TypeName;
  /** Lato del quadrato. */
  size: number;
};

/** Quadrato del colore del tipo con la sua icona al centro. */
export function TypeIcon({ type, size }: Props) {
  return (
    <View
      style={[
        styles.square,
        { width: size, height: size, borderRadius: Math.round(size / 4), backgroundColor: TYPE_COLORS[type] },
      ]}>
      <Image
        source={ICONS[type]}
        style={{ width: size * 0.6, height: size * 0.6 }}
        contentFit="contain"
        tintColor={typeTextColor(type)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  square: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
