import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, radius } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { Icon } from './Icon';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  /** Etichetta per lo screen reader; di base parla di Pokémon. */
  accessibilityLabel?: string;
};

export function SearchBar({ value, onChangeText, accessibilityLabel }: Props) {
  const { t } = useTranslation('pokedex');
  return (
    <View style={styles.field}>
      <Icon name="search" size={16} color={colors.textSubtle} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={t('search.placeholder')}
        placeholderTextColor={colors.textSubtle}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="never"
        accessibilityLabel={accessibilityLabel ?? t('search.accessibilityLabel')}
        style={styles.input}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('search.clear')}>
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
