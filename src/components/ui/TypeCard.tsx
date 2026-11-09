import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';

import { radius } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { themedStyles } from '@/theme/styles';
import { primaryType, typeCardColors } from '@/theme/typeColors';
import type { TypeName } from '@/types/pokemon';
import { formatNumber } from '@/utils/format';

import { AppText } from './AppText';
import { TypePill } from './TypePill';

type Props = {
  id: number;
  name: string;
  types: TypeName[];
  artworkUrl: string;
  onPress?: () => void;
};

/**
 * Carta «Collezione» di un Pokémon: a tutta larghezza, nel colore del tipo principale, con
 * numero, nome in Anton, etichette dei tipi, artwork a destra e numero grande in filigrana.
 */
export function TypeCard({ id, name, types, artworkUrl, onPress }: Props) {
  const card = typeCardColors(primaryType(types));
  const number = formatNumber(id);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${number} ${name}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <LinearGradient
        colors={card.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fill}
      />
      <AppText style={[styles.watermark, { color: card.watermark }]} numberOfLines={1}>
        {number.slice(1)}
      </AppText>
      <Image
        source={artworkUrl}
        style={styles.art}
        contentFit="contain"
        transition={150}
        recyclingKey={artworkUrl}
      />
      <View style={styles.texts}>
        <AppText variant="caption" color={card.text} style={styles.number}>
          {number}
        </AppText>
        <AppText variant="heading" color={card.text} numberOfLines={1} adjustsFontSizeToFit>
          {name}
        </AppText>
        <View style={styles.pills}>
          {types.map((type) => (
            <TypePill key={type} type={type} variant="onCard" cardColors={card} />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = themedStyles(() => ({
  card: {
    height: 124,
    borderRadius: radius.tile,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  watermark: {
    position: 'absolute',
    right: -6,
    bottom: -34,
    fontFamily: fonts.poster,
    fontSize: 120,
    lineHeight: 140,
  },
  art: {
    position: 'absolute',
    right: 10,
    top: 4,
    width: 124,
    height: 124,
  },
  texts: {
    paddingLeft: 18,
    paddingRight: 140,
    gap: 4,
  },
  number: { fontFamily: fonts.uiSemiBold },
  pills: { flexDirection: 'row', gap: 6, marginTop: 4 },
}));
