import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ARTWORK_STYLES, getArtworkUrl, type ArtworkStyle } from '@/api/pokemon';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { Icon } from './Icon';
import { PokeBallLogo } from './PokeBallLogo';

/** Pokémon usato per l'anteprima di ogni stile. */
const PREVIEW_ID = 25;

type Props = {
  artworkStyle: ArtworkStyle;
  onArtworkStyleChange: (style: ArtworkStyle) => void;
  onBack: () => void;
};

export function SettingsView({ artworkStyle, onArtworkStyleChange, onBack }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 },
      ]}>
      <Pressable
        onPress={onBack}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Torna all'elenco"
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <Icon name="back" size={18} color={colors.text} />
      </Pressable>
      <View style={styles.titleRow}>
        <PokeBallLogo />
        <Text style={styles.title} accessibilityRole="header">
          Impostazioni
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Artwork principale
        </Text>
        <Text style={styles.sectionHint}>
          Lo stile delle immagini nell&apos;elenco e in cima alla scheda di ogni Pokémon.
        </Text>
        <View style={styles.options} accessibilityRole="radiogroup">
          {ARTWORK_STYLES.map((style) => {
            const selected = style.id === artworkStyle;
            return (
              <Pressable
                key={style.id}
                onPress={() => onArtworkStyleChange(style.id)}
                accessibilityRole="radio"
                accessibilityLabel={`${style.label}. ${style.description}`}
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.pressed,
                ]}>
                <View style={styles.preview}>
                  <Image
                    source={getArtworkUrl(PREVIEW_ID, style.id)}
                    style={styles.previewImage}
                    contentFit="contain"
                    transition={150}
                  />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionLabel}>{style.label}</Text>
                  <Text style={styles.optionDescription}>{style.description}</Text>
                </View>
                {selected ? (
                  <Icon name="check" size={22} color={colors.accent} />
                ) : (
                  <View style={styles.radio} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    gap: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
    marginBottom: -16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 40,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    letterSpacing: -0.6,
    color: colors.text,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  sectionHint: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginBottom: 4,
  },
  options: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    paddingRight: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.8,
  },
  preview: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.factBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: 48,
    height: 48,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  optionDescription: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.line,
    marginHorizontal: 1,
  },
});
