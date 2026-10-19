import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { colors, radius } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { Icon } from './Icon';

export type PickerOption<T> = {
  /** null = la voce «tutte». */
  id: T | null;
  title: string;
  /** Riga secondaria sotto il titolo. */
  subtitle: string;
  /** Pallino colorato prima del titolo (es. il colore della categoria). */
  swatch?: string;
};

type Props<T> = {
  options: PickerOption<T>[];
  value: T | null;
  onChange: (id: T | null) => void;
  /** Testo del pulsante. */
  label: string;
  accessibilityLabel: string;
  accessibilityHint: string;
};

type Anchor = { top: number; right: number };

/** Pulsante nella barra in alto che apre un menu a scelta singola (generazioni, categorie…). */
export function OptionPicker<T extends string | number>({
  options,
  value,
  onChange,
  label,
  accessibilityLabel,
  accessibilityHint,
}: Props<T>) {
  const { t } = useTranslation('pokedex');
  const buttonRef = useRef<View>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [anchor, setAnchor] = useState<Anchor | null>(null);

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
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ expanded: anchor != null }}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonLabel}>{label}</Text>
        <Icon name="expand" size={12} color={colors.textMuted} />
      </Pressable>

      <Modal visible={anchor != null} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel={t('common.close')} />
        {anchor && (
          // Non esce dallo schermo: le voci in più scorrono e i titoli lunghi vanno a capo
          // (es. i giochi nella tab Mosse).
          <View
            style={[
              styles.menu,
              anchor,
              {
                maxHeight: Math.max(160, windowHeight - anchor.top - 16),
                maxWidth: windowWidth - anchor.right - 8,
              },
            ]}
            accessibilityRole="radiogroup">
            <ScrollView bounces={false}>
              {options.map((option, index) => {
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
                      <View style={styles.optionTitleRow}>
                        {option.swatch && (
                          <View style={[styles.swatch, { backgroundColor: option.swatch }]} />
                        )}
                        <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                          {option.title}
                        </Text>
                      </View>
                      <Text style={styles.optionRange}>{option.subtitle}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
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
    flexShrink: 1,
    gap: 1,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  swatch: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  optionTitle: {
    flexShrink: 1,
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
