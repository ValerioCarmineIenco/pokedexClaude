import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { getArtworkUrl, parsePokemonId } from '@/api/pokemon';
import { pokemonName } from '@/i18n/names';
import { useArtworkStyle } from '@/hooks/useArtworkStyle';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import type { EvolutionChain as Chain, EvolutionMethod, EvolutionStage } from '@/types/evolution';
import { formatNumber } from '@/utils/format';

import { ErrorState } from './ErrorState';
import { Icon } from './Icon';
import { SkeletonBlock } from './Skeleton';

const ARTWORK_SIZE = 96;
const BRANCH_ARTWORK_SIZE = 72;

type Props = {
  chain: Chain | undefined;
  isLoading: boolean;
  errorMessage: string | null;
  /** Id del Pokémon della scheda, evidenziato nella catena. */
  currentId: number;
  onOpenPokemon: (id: number) => void;
  onOpenItem: (id: number) => void;
  onOpenLocation: (id: number) => void;
  onRetry: () => void;
};

type Handlers = Pick<Props, 'currentId' | 'onOpenPokemon' | 'onOpenItem' | 'onOpenLocation'>;

/** Tab Evoluzioni: la catena completa, con i rami (es. Eevee) e il metodo di ogni passaggio. */
export function EvolutionChain({ chain, isLoading, errorMessage, onRetry, ...handlers }: Props) {
  const { t } = useTranslation('evolution');
  if (isLoading) {
    return (
      <View style={styles.skeleton}>
        {Array.from({ length: 3 }, (_, i) => (
          <View key={i} style={styles.skeletonStep}>
            {i > 0 && <SkeletonBlock width={90} height={12} />}
            <SkeletonBlock width={ARTWORK_SIZE} height={ARTWORK_SIZE} radius={ARTWORK_SIZE / 2} />
            <SkeletonBlock width={80} height={14} />
          </View>
        ))}
      </View>
    );
  }

  if (!chain) {
    return (
      <ErrorState
        title={t('chain.unavailableTitle')}
        message={errorMessage ?? t('chain.unavailableMessage')}
        actionLabel={t('chain.retry')}
        onAction={onRetry}
      />
    );
  }

  return (
    <View style={styles.chain}>
      <Text style={styles.count}>
        {chain.size === 1
          ? t('chain.doesNotEvolve', { name: pokemonName(chain.root.id, chain.root.name) })
          : t('chain.count', { count: chain.size })}
      </Text>
      <StageNode stage={chain.root} {...handlers} />
    </View>
  );
}

/** Uno stadio e, sotto, i suoi passaggi: in colonna se è uno solo, a riquadri se sono rami. */
function StageNode({ stage, compact = false, ...handlers }: Handlers & { stage: EvolutionStage; compact?: boolean }) {
  const next = stage.evolvesTo;
  return (
    <View style={styles.node}>
      <StageCard stage={stage} compact={compact} {...handlers} />
      {next.length === 1 && (
        <>
          <Methods stage={next[0]} {...handlers} />
          <StageNode stage={next[0]} compact={compact} {...handlers} />
        </>
      )}
      {next.length > 1 && (
        <>
          <Icon name="down" size={18} color={colors.textSubtle} />
          <View style={styles.branches}>
            {next.map((branch) => (
              <View
                key={branch.id}
                // I rami che si evolvono ancora (es. Tyrogue no, Poliwhirl sì) prendono tutta la riga.
                style={[styles.branch, branch.evolvesTo.length > 0 ? styles.branchWide : styles.branchHalf]}>
                <Methods stage={branch} arrow={false} {...handlers} />
                <StageNode stage={branch} compact {...handlers} />
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

function StageCard({
  stage,
  compact,
  currentId,
  onOpenPokemon,
}: Handlers & { stage: EvolutionStage; compact: boolean }) {
  const [artworkStyle] = useArtworkStyle();
  const { t } = useTranslation('evolution');
  const size = compact ? BRANCH_ARTWORK_SIZE : ARTWORK_SIZE;
  const name = pokemonName(stage.id, stage.name);
  const isCurrent = stage.id === currentId;
  // Le specie oltre le generazioni del Pokédex si vedono ma non hanno una scheda.
  const canOpen = !isCurrent && parsePokemonId(stage.id) !== null;
  return (
    <Pressable
      onPress={canOpen ? () => onOpenPokemon(stage.id) : undefined}
      disabled={!canOpen}
      accessibilityRole="button"
      accessibilityLabel={
        isCurrent
          ? t('chain.currentLabel', { name, number: formatNumber(stage.id) })
          : `${name}, ${formatNumber(stage.id)}`
      }
      accessibilityState={{ disabled: !canOpen, selected: isCurrent }}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        isCurrent && styles.cardCurrent,
        pressed && styles.pressed,
      ]}>
      <Image
        source={getArtworkUrl(stage.id, artworkStyle)}
        style={{ width: size, height: size }}
        contentFit="contain"
        transition={150}
        recyclingKey={String(stage.id)}
      />
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.number}>
        {formatNumber(stage.id)}
        {stage.isBaby ? ` · ${t('chain.baby')}` : ''}
      </Text>
    </Pressable>
  );
}

/** Come si arriva a `stage`: metodo attuale e, più piccoli, quelli dei giochi precedenti. */
function Methods({
  stage,
  arrow = true,
  onOpenItem,
  onOpenLocation,
}: Handlers & { stage: EvolutionStage; arrow?: boolean }) {
  const { t } = useTranslation('evolution');
  const methods =
    stage.methods.length > 0 ? stage.methods : [[{ kind: 'text', text: t('chain.unknownMethod') }] as EvolutionMethod];
  return (
    <View style={styles.methods}>
      {arrow && <Icon name="down" size={18} color={colors.textSubtle} />}
      {methods.map((method, i) => (
        <MethodText key={i} method={method} style={styles.method} onOpenItem={onOpenItem} onOpenLocation={onOpenLocation} />
      ))}
      {stage.legacyMethods.length > 0 && (
        <Text style={styles.legacy}>
          {t('chain.previousGames')}
          {stage.legacyMethods.map((method, i) => (
            <Text key={i}>
              {i > 0 && ' · '}
              <MethodText method={method} onOpenItem={onOpenItem} onOpenLocation={onOpenLocation} />
            </Text>
          ))}
        </Text>
      )}
    </View>
  );
}

/** Il testo del metodo; oggetti e luoghi si toccano per aprirne il dettaglio. */
function MethodText({
  method,
  style,
  onOpenItem,
  onOpenLocation,
}: Pick<Handlers, 'onOpenItem' | 'onOpenLocation'> & {
  method: EvolutionMethod;
  style?: (typeof styles)['method'];
}) {
  return (
    <Text style={style}>
      {method.map((part, i) => {
        if (part.kind === 'text') return part.text;
        const onPress =
          part.kind === 'item' ? () => onOpenItem(part.itemId) : () => onOpenLocation(part.locationId);
        return (
          <Text key={i} style={styles.link} onPress={onPress} accessibilityRole="link">
            {part.text}
          </Text>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  chain: {
    gap: 14,
  },
  count: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textSubtle,
  },
  node: {
    alignItems: 'center',
    gap: 6,
    alignSelf: 'stretch',
  },
  card: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.factBackground,
    minWidth: 140,
  },
  cardCompact: {
    minWidth: 0,
    alignSelf: 'stretch',
  },
  cardCurrent: {
    borderColor: colors.text,
  },
  pressed: {
    opacity: 0.6,
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  number: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSubtle,
  },
  methods: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  method: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
    textAlign: 'center',
  },
  legacy: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSubtle,
    textAlign: 'center',
  },
  link: {
    color: colors.accent,
    textDecorationLine: 'underline',
  },
  branches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    alignSelf: 'stretch',
  },
  branch: {
    alignItems: 'center',
    // Card in fondo al riquadro: nella stessa riga restano allineate anche con testi lunghi.
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  branchHalf: {
    width: '48%',
  },
  branchWide: {
    width: '100%',
  },
  skeleton: {
    alignItems: 'center',
    gap: 18,
    paddingTop: 8,
  },
  skeletonStep: {
    alignItems: 'center',
    gap: 8,
  },
});
