import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

type Props = {
  message: string;
  actionLabel: string;
  onAction: () => void;
  bottomInset?: number;
};

/** Avviso in basso quando c'è un errore ma l'elenco ha già dati da mostrare. */
export function ErrorToast({ message, actionLabel, onAction, bottomInset = 0 }: Props) {
  return (
    <View style={[styles.toast, { bottom: 14 + bottomInset }]} accessibilityLiveRegion="polite">
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
      <Pressable onPress={onAction} hitSlop={12} accessibilityRole="button">
        <Text style={styles.action}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 12,
    right: 12,
    minHeight: 48,
    backgroundColor: colors.toast,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  message: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#FFFFFF',
  },
  action: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.toastAction,
  },
});
