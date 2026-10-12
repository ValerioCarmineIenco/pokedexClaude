import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { FIRST_POKEMON_ID, GENERATIONS, LAST_POKEMON_ID } from '@/api/generations';
import { colors, radius } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { formatNumber } from '@/utils/format';
import { shortGenerationLabel } from '@/utils/generation';

import { Icon } from './Icon';

type Props = {
  /** null = tutte le generazioni. */
  value: number | null;
  onChange: (generationId: number | null) => void;
};

type Anchor = { top: number; right: number };

const OPTIONS = [
  {
    id: null,
    title: 'Tutte le generazioni',
    range: `${formatNumber(FIRST_POKEMON_ID)}–${formatNumber(LAST_POKEMON_ID)}`,
  },
  ...GENERATIONS.map((g) => ({
    id: g.id as number | null,
    title: g.name,
    range: `${g.region} · ${formatNumber(g.firstId)}–${formatNumber(g.lastId)}`,
  })),
];

/** Pulsante nella barra in alto che apre il menu delle generazioni. */
export function GenerationPicker({ value, onChange }: Props) {
  const buttonRef = useRef<View>(null);
  const { width: windowWidth } = useWindowDimensions();
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const selected = GENERATIONS.find((g) => g.id === value);
  const label = selected ? shortGenerationLabel(selected) : 'Tutte';

  const open = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ top: y + height + 6, right: Math.max(8, windowWidth - (x + width)) });
    });
  };
  const close = () => setAnchor(null);

  return (
    <>
      <Pressable
        ref={buttonRef}
        onPress={open}
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel={`Generazione: ${selected ? selected.name : 'tutte'}`}
        accessibilityHint="Apre la scelta della generazione"
        accessibilityState={{ expanded: anchor != null }}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonLabel}>{label}</Text>
        <Icon name="expand" size={12} color={colors.textMuted} />
      </Pressable>

      <Modal visible={anchor != null} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Chiudi" />
        {anchor && (
          <View style={[styles.menu, anchor]} accessibilityRole="radiogroup">
            {OPTIONS.map((option, index) => {
              const isSelected = option.id === value;
              return (
                <Pressable
                  key={option.id ?? 'all'}
                  onPress={() => {
                    close();
                    if (!isSelected) onChange(option.id);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  style={({ pressed }) => [
                    styles.option,
                    index > 0 && styles.optionDivider,
                    pressed && styles.optionPressed,
                  ]}>
                  <View style={[styles.marker, isSelected && styles.markerSelected]} />
                  <View style={styles.optionText}>
                    <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                      {option.title}
                    </Text>
                    <Text style={styles.optionRange}>{option.range}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: radius.field,
    backgroundColor: colors.field,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(29, 28, 34, 0.08)',
  },
  menu: {
    position: 'absolute',
    minWidth: 220,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    paddingVertical: 4,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingRight: 16,
    paddingLeft: 10,
  },
  optionDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  optionPressed: {
    backgroundColor: colors.factBackground,
  },
  marker: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
  },
  markerSelected: {
    backgroundColor: colors.accent,
  },
  optionText: {
    gap: 1,
  },
  optionTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.text,
  },
  optionTitleSelected: {
    fontFamily: fonts.bodyBold,
  },
  optionRange: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSubtle,
  },
});
