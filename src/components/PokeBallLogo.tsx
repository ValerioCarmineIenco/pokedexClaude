import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';

/** Piccola Poké Ball accanto al titolo. */
export function PokeBallLogo({ size = 22 }: { size?: number }) {
  const border = Math.max(2, Math.round(size / 11));
  const center = size * 0.42;
  return (
    <View
      style={[styles.ball, { width: size, height: size, borderRadius: size / 2, borderWidth: border }]}>
      <View style={styles.top} />
      <View style={[styles.band, { height: border }]} />
      <View
        style={[
          styles.center,
          { width: center, height: center, borderRadius: center / 2, borderWidth: border },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ball: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: colors.accent,
  },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    marginTop: -1,
    backgroundColor: colors.text,
  },
  center: {
    backgroundColor: colors.surface,
    borderColor: colors.text,
  },
});
