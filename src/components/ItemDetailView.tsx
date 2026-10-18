import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Item } from '@/types/item';
import { getCategoryColors } from '@/theme/categoryColors';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { CategoryBadge } from './CategoryBadge';
import { ErrorState } from './ErrorState';
import { Icon } from './Icon';
import { PokeBallMark } from './PokeBallMark';
import { SkeletonBlock } from './Skeleton';

/** Riquadro bianco quadrato che contiene l'immagine dell'oggetto. */
const TILE_SIZE = 168;
/** Parte bianca arrotondata in fondo all'intestazione, su cui poggia il riquadro. */
const SHEET_CAP = 72;
/** Lato delle carte quadrate dei correlati. */
const RELATED_SIZE = 108;

export type ItemDetailViewProps = {
  item: Item | undefined;
  /** Dati principali in arrivo (non ancora in cache). */
  isLoading: boolean;
  errorMessage: string | null;
  /** L'id della rotta non è un numero valido. */
  isInvalidId: boolean;
  /** Al massimo 5 oggetti; undefined mentre arrivano o se non sono arrivati. */
  related: Item[] | undefined;
  isRelatedLoading: boolean;
  onOpenItem: (id: number) => void;
  onBack: () => void;
  onRetry: () => void;
};

export function ItemDetailView({
  item,
  isLoading,
  errorMessage,
  isInvalidId,
  related,
  isRelatedLoading,
  onOpenItem,
  onBack,
  onRetry,
}: ItemDetailViewProps) {
  const { t } = useTranslation('items');
  const insets = useSafeAreaInsets();
  const palette = item ? getCategoryColors(item.category) : null;

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

  if (isInvalidId || (!item && !isLoading)) {
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
      <View
        style={[
          styles.hero,
          { paddingTop: insets.top, backgroundColor: palette?.tint ?? colors.skeleton },
        ]}>
        <View style={styles.nav}>{backButton}</View>
        <PokeBallMark size={210} thickness={30} style={styles.heroMark} />
        {item ? (
          <>
            <Text style={styles.name} numberOfLines={2} accessibilityRole="header">
              {item.name}
            </Text>
            <View style={styles.badges}>
              <CategoryBadge category={item.category} size="large" />
            </View>
          </>
        ) : (
          <View style={styles.heroSkeleton}>
            <SkeletonBlock width="55%" height={28} />
            <SkeletonBlock width={90} height={22} radius={999} />
          </View>
        )}
        <View style={styles.sheetCap} />
        <View style={styles.tileWrap}>
          <View style={[styles.tile, palette && { borderColor: palette.soft }]}>
            {item ? (
              <Image
                source={item.imageUrl}
                style={styles.image}
                contentFit="contain"
                transition={200}
                accessibilityLabel={t('detail.imageLabel', { name: item.name })}
              />
            ) : (
              <SkeletonBlock width={96} height={96} radius={20} />
            )}
          </View>
        </View>
      </View>

      <View style={styles.sheet}>
        {item ? (
          <Text style={styles.description}>
            {item.description || t('detail.noDescription')}
          </Text>
        ) : (
          <View style={styles.descriptionSkeleton}>
            <SkeletonBlock width="100%" height={12} />
            <SkeletonBlock width="92%" height={12} />
            <SkeletonBlock width="60%" height={12} />
          </View>
        )}

        {(isLoading || isRelatedLoading || (related && related.length > 0)) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              {t('detail.related')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.relatedScroll}
              contentContainerStyle={styles.relatedRow}>
              {related && related.length > 0
                ? related.map((other) => (
                    <RelatedTile key={other.id} item={other} onPress={() => onOpenItem(other.id)} />
                  ))
                : Array.from({ length: 4 }, (_, i) => (
                    <SkeletonBlock key={i} width={RELATED_SIZE} height={RELATED_SIZE} radius={16} />
                  ))}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function RelatedTile({ item, onPress }: { item: Item; onPress: () => void }) {
  const palette = getCategoryColors(item.category);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${palette.label}`}
      style={({ pressed }) => [
        styles.relatedTile,
        { backgroundColor: palette.soft },
        pressed && styles.relatedPressed,
      ]}>
      <Image source={item.imageUrl} style={styles.relatedImage} contentFit="contain" transition={150} />
      <Text style={styles.relatedName} numberOfLines={2}>
        {item.name}
      </Text>
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
    borderColor: colors.field,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 112,
    height: 112,
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
  relatedScroll: {
    marginHorizontal: -20,
  },
  relatedRow: {
    paddingHorizontal: 20,
    gap: 10,
  },
  relatedTile: {
    width: RELATED_SIZE,
    height: RELATED_SIZE,
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  relatedPressed: {
    opacity: 0.75,
  },
  relatedImage: {
    width: 48,
    height: 48,
  },
  relatedName: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
    color: colors.text,
  },
});
