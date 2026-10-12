import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, radius } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { Icon } from './Icon';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

export function SearchBar({ value, onChangeText }: Props) {
  return (
    <View style={styles.field}>
      <Icon name="search" size={16} color={colors.textSubtle} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Cerca per nome"
        placeholderTextColor={colors.textSubtle}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="never"
        accessibilityLabel="Cerca un Pokémon per nome"
        style={styles.input}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Cancella la ricerca">
          <Icon name="close" size={16} color={colors.textSubtle} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    height: 44,
    borderRadius: radius.field,
    backgroundColor: colors.field,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
  },
});
