import { View } from 'react-native';

import { radius } from '@/theme/colors';
import { TYPE_COLORS, typeTextColor } from '@/theme/typeColors';
import { TYPE_LABELS } from '@/theme/typeNames';
import { themedStyles } from '@/theme/styles';
import type { TypeName } from '@/types/pokemon';

import { AppText } from './AppText';

type Props = {
  type: TypeName;
  /**
   * `solid`: pieno nel colore del tipo (scheda, squadre).
   * `onCard`: velo scuro sopra una carta già colorata, col testo della carta.
   */
  variant?: 'solid' | 'onCard';
  /** Solo per `onCard`: colori di fondo e testo della carta (da `typeCardColors`). */
  cardColors?: { pill: string; text: string };
  /** Testo dopo il nome, es. «×3» per le debolezze. */
  suffix?: string;
};

/** Etichetta di un tipo in maiuscoletto. */
export function TypePill({ type, variant = 'solid', cardColors, suffix }: Props) {
  const onCard = variant === 'onCard';
  const background = onCard ? (cardColors?.pill ?? 'rgba(0, 0, 0, 0.2)') : TYPE_COLORS[type];
  const color = onCard ? (cardColors?.text ?? '#FFFFFF') : typeTextColor(type);
  const label = suffix ? `${TYPE_LABELS[type]} ${suffix}` : TYPE_LABELS[type];
  return (
    <View style={[styles.pill, { backgroundColor: background }]}>
      <AppText variant="label" color={color} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const styles = themedStyles(() => ({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.field,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
}));
