import { StyleSheet, View } from 'react-native';

import type { AppIcon } from '@/purchases/appIcon';

/** Anteprima di un'icona dell'app: una Poké Ball sui colori della variante. */
export function AppIconPreview({ icon, size = 60 }: { icon: AppIcon; size?: number }) {
  const ball = size * 0.64;
  const border = Math.max(2, Math.round(ball / 12));
  const center = ball * 0.36;
  return (
    <View
      style={[
        styles.icon,
        { width: size, height: size, borderRadius: size * 0.23, backgroundColor: icon.background },
      ]}>
      <View
        style={[
          styles.ball,
          {
            width: ball,
            height: ball,
            borderRadius: ball / 2,
            borderWidth: border,
            borderColor: icon.ink,
            backgroundColor: icon.bottom,
          },
        ]}>
        <View style={[styles.top, { backgroundColor: icon.top }]} />
        <View style={[styles.band, { height: border, marginTop: -border / 2, backgroundColor: icon.ink }]} />
        <View
          style={{
            width: center,
            height: center,
            borderRadius: center / 2,
            borderWidth: border,
            borderColor: icon.ink,
            backgroundColor: icon.bottom,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ball: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  band: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
  },
});
