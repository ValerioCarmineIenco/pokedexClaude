import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { colors } from '@/theme/colors';
import type { PokemonSummary } from '@/types/pokemon';
import { formatName } from '@/utils/format';

import { Icon } from '../Icon';
import { PokemonCard, ROW_CARD_HEIGHT } from '../PokemonCard';

const GAP = 8;
const SLOT = ROW_CARD_HEIGHT + GAP;
const SPRING = { damping: 22, stiffness: 260 };

type Props = {
  members: PokemonSummary[];
  /** Nuovo ordine degli id, a trascinamento finito. */
  onReorder: (ids: number[]) => void;
  onRemove: (pokemon: PokemonSummary) => void;
  onOpen: (pokemon: PokemonSummary) => void;
  /** Durante il trascinamento la pagina non deve scorrere. */
  onDragChange: (dragging: boolean) => void;
};

/**
 * I membri della squadra, riordinabili trascinando la maniglia a sinistra (stessa logica su
 * iOS, Android e web). Per chi usa uno screen reader la maniglia offre «Sposta su/giù».
 */
export function TeamSlots({ members, onReorder, onRemove, onOpen, onDragChange }: Props) {
  // Ordine corrente degli id: cambia già durante il trascinamento, le righe lo seguono.
  const order = useSharedValue(members.map((member) => member.id));
  const key = members.map((member) => member.id).join(',');

  useEffect(() => {
    order.value = key ? key.split(',').map(Number) : [];
  }, [key, order]);

  const move = (id: number, offset: number) => {
    const ids = members.map((member) => member.id);
    const from = ids.indexOf(id);
    const to = from + offset;
    if (to < 0 || to >= ids.length) return;
    ids.splice(to, 0, ...ids.splice(from, 1));
    onReorder(ids);
  };

  return (
    <View style={{ height: members.length * SLOT - (members.length > 0 ? GAP : 0) }}>
      {members.map((member) => (
        <DraggableRow
          key={member.id}
          pokemon={member}
          order={order}
          onDrop={onReorder}
          onMove={(offset) => move(member.id, offset)}
          onRemove={() => onRemove(member)}
          onOpen={onOpen}
          onDragChange={onDragChange}
        />
      ))}
    </View>
  );
}

function DraggableRow({
  pokemon,
  order,
  onDrop,
  onMove,
  onRemove,
  onOpen,
  onDragChange,
}: {
  pokemon: PokemonSummary;
  order: SharedValue<number[]>;
  onDrop: (ids: number[]) => void;
  onMove: (offset: number) => void;
  onRemove: () => void;
  onOpen: (pokemon: PokemonSummary) => void;
  onDragChange: (dragging: boolean) => void;
}) {
  const id = pokemon.id;
  const index = useDerivedValue(() => Math.max(order.value.indexOf(id), 0));
  const dragging = useSharedValue(false);
  const startY = useSharedValue(0);
  const dragY = useSharedValue(0);

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin(() => {
      dragging.value = true;
      startY.value = index.value * SLOT;
      dragY.value = startY.value;
      scheduleOnRN(onDragChange, true);
    })
    .onUpdate((event) => {
      const count = order.value.length;
      const y = Math.min(Math.max(startY.value + event.translationY, 0), (count - 1) * SLOT);
      dragY.value = y;
      const target = Math.round(y / SLOT);
      const current = order.value.indexOf(id);
      if (target !== current && current >= 0) {
        const next = order.value.filter((other) => other !== id);
        next.splice(target, 0, id);
        order.set(next);
      }
    })
    .onFinalize(() => {
      if (!dragging.value) return;
      dragging.value = false;
      scheduleOnRN(onDragChange, false);
      scheduleOnRN(onDrop, [...order.value]);
    });

  const style = useAnimatedStyle(() => ({
    top: dragging.value ? dragY.value : withSpring(index.value * SLOT, SPRING),
    zIndex: dragging.value ? 10 : 0,
    transform: [{ scale: withSpring(dragging.value ? 1.03 : 1, SPRING) }],
    shadowOpacity: withSpring(dragging.value ? 0.18 : 0, SPRING),
  }));

  const name = formatName(pokemon.name);

  return (
    <Animated.View style={[styles.row, style]}>
      <GestureDetector gesture={pan}>
        <View
          style={styles.handle}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={`Sposta ${name}`}
          accessibilityHint="Trascina per cambiare l'ordine"
          accessibilityActions={[
            { name: 'increment', label: 'Sposta giù' },
            { name: 'decrement', label: 'Sposta su' },
          ]}
          onAccessibilityAction={(event) => onMove(event.nativeEvent.actionName === 'increment' ? 1 : -1)}>
          <Icon name="drag" size={20} color={colors.textSubtle} />
        </View>
      </GestureDetector>
      <View style={styles.card}>
        <PokemonCard pokemon={pokemon} variant="row" onPress={onOpen} />
      </View>
      <Pressable
        onPress={onRemove}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`Togli ${name} dalla squadra`}
        style={({ pressed }) => [styles.remove, pressed && styles.pressed]}>
        <Icon name="remove" size={20} color={colors.textSubtle} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ROW_CARD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  handle: {
    width: 36,
    height: ROW_CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  card: {
    flex: 1,
  },
  remove: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.field,
  },
});
