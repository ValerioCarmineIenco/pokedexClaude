import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getArtworkUrl } from '@/api/pokemon';
import { useArtworkStyle } from '@/hooks/useArtworkStyle';
import { useLanguage } from '@/i18n';
import { pokemonName } from '@/i18n/names';
import type { Ability, AbilityPokemon } from '@/types/ability';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { formatNumber } from '@/utils/format';
import { romanNumeral } from '@/utils/generation';

import { ErrorState } from '../ErrorState';
import { Icon } from '../Icon';
import { PokeBallMark } from '../PokeBallMark';
import { SkeletonBlock } from '../Skeleton';

/** Colore delle abilità: intestazione, etichetta e riquadro. */
const ABILITY_COLOR = '#5B6CD9';
const ABILITY_TINT = 'rgb(173, 181, 236)';
const ABILITY_SOFT = 'rgb(231, 233, 249)';

/** Riquadro bianco quadrato con il simbolo dell'abilità. */
const TILE_SIZE = 168;
/** Parte bianca arrotondata in fondo all'intestazione, su cui poggia il riquadro. */
const SHEET_CAP = 72;
/** Lato delle carte quadrate dei Pokémon. */
const POKEMON_SIZE = 108;

export type AbilityDetailViewProps = {
  ability: Ability | undefined;
  /** Dati in arrivo (non ancora in cache). */
  isLoading: boolean;
  errorMessage: string | null;
  /** L'id della rotta non è un'abilità valida. */
  isInvalidId: boolean;
  onOpenPokemon: (id: number) => void;
  onBack: () => void;
  onRetry: () => void;
};

export function AbilityDetailView({
  ability,
  isLoading,
  errorMessage,
  isInvalidId,
  onOpenPokemon,
  onBack,
  onRetry,
}: AbilityDetailViewProps) {
  const { t } = useTranslation('abilities');
  const language = useLanguage();
  const insets = useSafeAreaInsets();
  // L'effetto per esteso spesso c'è solo in inglese: lo si dice accanto al titolo.
  const isEffectFallback = !!ability?.effectLanguage && language !== 'en' && ability.effectLanguage === 'en';

  const backButton = (
    <Pressable
      onPress={onBack}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={t('detail.back')}
      style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
      <Icon name="back" size={18} color={colors.text} />
    </Pressable>
  );

  if (isInvalidId || (!ability && !isLoading)) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={[styles.nav, styles.navPadding]}>{backButton}</View>
        {isInvalidId ? (
          <ErrorState
            title={t('detail.notFoundTitle')}
            message={t('detail.notFoundMessage')}
            actionLabel={t('detail.back')}
            actionStyle="ghost"
            onAction={onBack}
          />
        ) : (
          <ErrorState
            title={t('errors.offlineTitle')}
            message={errorMessage ?? t('errors.offlineMessage')}
            actionLabel={t('errors.retry')}
            onAction={onRetry}
          />
        )}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }}
      showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { paddingTop: insets.top }]}>
        <View style={styles.nav}>{backButton}</View>
        <PokeBallMark size={210} thickness={30} style={styles.heroMark} />
        {ability ? (
          <>
            <Text style={styles.name} numberOfLines={2} accessibilityRole="header">
              {ability.name}
            </Text>
            <View style={styles.badges}>
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>
                  {t('detail.generation', { numeral: romanNumeral(ability.generation) })}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.heroSkeleton}>
            <SkeletonBlock width="55%" height={28} />
            <SkeletonBlock width={70} height={22} radius={999} />
          </View>
        )}
        <View style={styles.sheetCap} />
        <View style={styles.tileWrap}>
          <View style={styles.tile}>
            <Icon name="sparkles" size={64} color={ABILITY_COLOR} />
          </View>
        </View>
      </View>

      <View style={styles.sheet}>
        {ability ? (
          <Text style={styles.description}>
            {ability.description || t('detail.noDescription')}
          </Text>
        ) : (
          <View style={styles.descriptionSkeleton}>
            <SkeletonBlock width="100%" height={12} />
            <SkeletonBlock width="92%" height={12} />
            <SkeletonBlock width="60%" height={12} />
          </View>
        )}

        {ability?.effect && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              {t('detail.effect')}
              {isEffectFallback && <Text style={styles.sectionNote}> {t('detail.effectNote')}</Text>}
            </Text>
            <View style={styles.effectBox}>
              <Text style={styles.effect}>{ability.effect}</Text>
            </View>
          </View>
        )}

        {(isLoading || (ability && ability.pokemon.length > 0)) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              {t('detail.pokemonWith')}
              {ability ? <Text style={styles.sectionCount}>  {ability.pokemon.length}</Text> : null}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.relatedScroll}
              contentContainerStyle={styles.relatedRow}>
              {ability
                ? ability.pokemon.map((pokemon) => (
                    <PokemonTile
                      key={pokemon.id}
                      pokemon={pokemon}
                      onPress={() => onOpenPokemon(pokemon.id)}
                    />
                  ))
                : Array.from({ length: 4 }, (_, i) => (
                    <SkeletonBlock key={i} width={POKEMON_SIZE} height={POKEMON_SIZE} radius={16} />
                  ))}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function PokemonTile({ pokemon, onPress }: { pokemon: AbilityPokemon; onPress: () => void }) {
  const { t } = useTranslation('abilities');
  const [artworkStyle] = useArtworkStyle();
  const name = pokemonName(pokemon.id, pokemon.name);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t(pokemon.isHidden ? 'detail.pokemonLabelHidden' : 'detail.pokemonLabel', {
        name,
        number: pokemon.id,
      })}
      style={({ pressed }) => [
        styles.relatedTile,
        { backgroundColor: ABILITY_SOFT },
        pressed && styles.relatedPressed,
      ]}>
      {pokemon.isHidden && (
        <View style={styles.hiddenBadge}>
          <Text style={styles.hiddenLabel}>{t('detail.hidden')}</Text>
        </View>
      )}
      <Image
        source={getArtworkUrl(pokemon.id, artworkStyle)}
        style={styles.relatedImage}
        contentFit="contain"
        transition={150}
      />
      <Text style={styles.relatedName} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.relatedNumber}>{formatNumber(pokemon.id)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  navPadding: {
    paddingHorizontal: 16,
  },
  hero: {
    paddingHorizontal: 16,
    paddingBottom: TILE_SIZE + 12,
    overflow: 'hidden',
    backgroundColor: ABILITY_TINT,
  },
  sheetCap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_CAP,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  heroMark: {
    right: -50,
    top: 70,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  name: {
    fontFamily: fonts.displayBold,
    fontSize: 34,
    letterSpacing: -0.8,
    color: colors.text,
    marginTop: 4,
  },
  badges: {
    flexDirection: 'row',
    marginTop: 10,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: ABILITY_COLOR,
  },
  badgeLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.2,
    color: '#FFFFFF',
  },
  heroSkeleton: {
    gap: 10,
    marginTop: 4,
  },
  tileWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 8,
    alignItems: 'center',
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 28,
    borderWidth: 6,
    borderColor: ABILITY_SOFT,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 22,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: '#55525C',
  },
  descriptionSkeleton: {
    gap: 10,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  sectionCount: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textSubtle,
  },
  sectionNote: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSubtle,
  },
  effectBox: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: ABILITY_SOFT,
  },
  effect: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  relatedScroll: {
    marginHorizontal: -20,
  },
  relatedRow: {
    paddingHorizontal: 20,
    gap: 10,
  },
  relatedTile: {
    width: POKEMON_SIZE,
    height: POKEMON_SIZE + 16,
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  relatedPressed: {
    opacity: 0.75,
  },
  relatedImage: {
    width: 64,
    height: 64,
  },
  relatedName: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
    color: colors.text,
    marginTop: 2,
  },
  relatedNumber: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
  hiddenBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: 'rgba(29, 28, 34, 0.75)',
  },
  hiddenLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: '#FFFFFF',
  },
});
