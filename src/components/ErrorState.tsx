import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

type Props = {
  title: string;
  message: string;
  /** Simbolo grande nel cerchio tratteggiato. */
  glyph?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** "primary" per Riprova, "ghost" per azioni secondarie come Cancella. */
  actionStyle?: 'primary' | 'ghost';
};

/** Stato a schermo intero per errori di rete e ricerche senza risultati. */
export function ErrorState({
  title,
  message,
  glyph = '?',
  actionLabel,
  onAction,
  actionStyle = 'primary',
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={styles.glyph}>{glyph}</Text>
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            actionStyle === 'ghost' && styles.buttonGhost,
            pressed && styles.pressed,
          ]}>
          <Text style={[styles.buttonLabel, actionStyle === 'ghost' && styles.buttonLabelGhost]}>
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    gap: 12,
  },
  circle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 6,
    borderStyle: 'dashed',
    borderColor: '#D8D4CF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  glyph: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    color: '#B9B4AD',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 300,
  },
  button: {
    marginTop: 8,
    minHeight: 44,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D8D4CF',
  },
  pressed: {
    opacity: 0.8,
  },
  buttonLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  buttonLabelGhost: {
    color: colors.text,
  },
});
