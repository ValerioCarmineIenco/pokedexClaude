import { Image } from 'expo-image';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import type { ArtworkGeneration, ArtworkGroup, ArtworkImage, PokemonArtworks } from '@/types/pokemon';

import { ErrorState } from './ErrorState';
import { Icon } from './Icon';
import { SkeletonBlock } from './Skeleton';

const COLUMNS = 3;
const GAP = 10;
/** Margine orizzontale del foglio bianco della scheda. */
const SHEET_PADDING = 20;

type Props = {
  artworks: PokemonArtworks | undefined;
  isLoading: boolean;
  errorMessage: string | null;
  /** Nome già formattato, per le etichette di accessibilità. */
  pokemonName: string;
  onRetry: () => void;
};

/** Tab Artwork: tutte le immagini del Pokémon, per fonte e poi per generazione. */
export function ArtworkGallery({ artworks, isLoading, errorMessage, pokemonName, onRetry }: Props) {
  const { width } = useWindowDimensions();
  const tileSize = Math.floor((width - SHEET_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS);
  const [selected, setSelected] = useState<{ image: ArtworkImage; group: string } | null>(null);

  if (isLoading) {
    return (
      <View style={styles.gallery}>
        <SkeletonBlock width={140} height={16} />
        <View style={styles.grid}>
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonBlock key={i} width={tileSize} height={tileSize + 26} radius={12} />
          ))}
        </View>
      </View>
    );
  }

  if (!artworks) {
    return (
      <ErrorState
        title="Artwork non disponibili"
        message={errorMessage ?? 'Non riesco a caricare le immagini. Controlla la rete e riprova.'}
        actionLabel="Riprova"
        onAction={onRetry}
      />
    );
  }

  const renderGroup = (group: ArtworkGroup) => (
    <View key={group.id} style={styles.group}>
      <Text style={styles.groupTitle} accessibilityRole="header">
        {group.title}
      </Text>
      <View style={styles.grid}>
        {group.images.map((image) => (
          <Tile
            key={image.key}
            image={image}
            size={tileSize}
            accessibilityLabel={`${pokemonName}, ${group.title}, ${image.label}`}
            onPress={() => setSelected({ image, group: group.title })}
          />
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.gallery}>
      <Text style={styles.count}>
        {artworks.imageCount === 1 ? '1 immagine' : `${artworks.imageCount} immagini`}
      </Text>
      {artworks.featured.map(renderGroup)}

      {artworks.generations.length > 0 && (
        <View style={styles.group}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Sprite dei giochi
          </Text>
          {artworks.generations.map((generation) => (
            <GenerationSection key={generation.id} generation={generation} renderGroup={renderGroup} />
          ))}
        </View>
      )}

      <ArtworkViewer
        image={selected?.image ?? null}
        title={selected ? `${pokemonName} · ${selected.group}` : ''}
        onClose={() => setSelected(null)}
      />
    </View>
  );
}

/** Generazione richiudibile: chiusa all'inizio, così le immagini si scaricano solo se servono. */
function GenerationSection({
  generation,
  renderGroup,
}: {
  generation: ArtworkGeneration;
  renderGroup: (group: ArtworkGroup) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.generation}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${generation.title}, ${generation.imageCount} immagini`}
        style={({ pressed }) => [styles.generationHeader, pressed && styles.pressed]}>
        <Text style={styles.generationTitle}>{generation.title}</Text>
        <Text style={styles.generationCount}>{generation.imageCount}</Text>
        <View style={open && styles.chevronOpen}>
          <Icon name="expand" size={16} color={colors.textSubtle} />
        </View>
      </Pressable>
      {open && <View style={styles.generationBody}>{generation.games.map(renderGroup)}</View>}
    </View>
  );
}

function Tile({
  image,
  size,
  accessibilityLabel,
  onPress,
}: {
  image: ArtworkImage;
  size: number;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="imagebutton"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.tile, { width: size }, pressed && styles.pressed]}>
      <Image
        source={image.url}
        style={{ width: size - 16, height: size - 16 }}
        contentFit="contain"
        transition={150}
        recyclingKey={image.key}
      />
      <Text style={styles.tileLabel} numberOfLines={2}>
        {image.label}
      </Text>
    </Pressable>
  );
}

/** Immagine a tutto schermo; si chiude toccando ovunque. */
function ArtworkViewer({
  image,
  title,
  onClose,
}: {
  image: ArtworkImage | null;
  title: string;
  onClose: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const size = Math.min(width - 48, height * 0.6, 480);
  return (
    <Modal visible={image !== null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.viewer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Chiudi immagine">
        {image && (
          <>
            <View style={[styles.viewerCard, { width: size, height: size }]}>
              <Image
                source={image.url}
                style={{ width: size - 32, height: size - 32 }}
                contentFit="contain"
                accessibilityLabel={`${title}, ${image.label}`}
              />
            </View>
            <Text style={styles.viewerTitle}>{title}</Text>
            <Text style={styles.viewerLabel}>{image.label}</Text>
          </>
        )}
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  gallery: {
    gap: 18,
  },
  count: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textSubtle,
    marginBottom: -8,
  },
  group: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  groupTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  tile: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: colors.factBackground,
  },
  tileLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.7,
  },
  generation: {
    gap: 14,
  },
  generationHeader: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
  },
  generationTitle: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  generationCount: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSubtle,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  generationBody: {
    gap: 18,
    paddingBottom: 6,
  },
  viewer: {
    flex: 1,
    backgroundColor: 'rgba(29, 28, 34, 0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  viewerCard: {
    backgroundColor: colors.surface,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  viewerTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  viewerLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
