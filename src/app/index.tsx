import { StyleSheet, Text, View } from 'react-native';

export default function PokemonListScreen() {
  return (
    <View style={styles.container}>
      <Text>Elenco dei Pokémon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
