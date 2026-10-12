import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  size: number;
  thickness: number;
  style?: StyleProp<ViewStyle>;
};

/** Anello bianco semitrasparente, la Poké Ball in filigrana dietro l'artwork. */
export function PokeBallMark({ size, thickness, style }: Props) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size / 2, borderWidth: thickness },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
});
