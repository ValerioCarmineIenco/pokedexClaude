import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LocationSummary } from '@/types/location';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

import { Icon } from '../Icon';

/** Altezza della scheda, per lo scheletro di caricamento. */
export const LOCATION_CARD_HEIGHT = 84;

type Props = {
  location: LocationSummary;
  /** Mostra la regione accanto ai contatori (quando l'elenco non è filtrato per regione). */
  showRegion?: boolean;
  onPress: (location: LocationSummary) => void;
};

function Badge({ label, background, color }: { label: string; background: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={[styles.badgeText, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** Località dell'elenco: nome e due badge con il numero di Pokémon e di giochi. */
export function LocationCard({ location, showRegion = false, onPress }: Props) {
  const { t } = useTranslation('locations');
  const region = showRegion ? location.region?.label : undefined;
  const pokemonLabel = t('card.pokemon', { count: location.pokemonCount });
  const gamesLabel = t('card.games', { count: location.gameCount });
  const accessibilityLabel = region
    ? t('card.a11yWithRegion', { name: location.name, region, pokemon: pokemonLabel, games: gamesLabel })
    : t('card.a11y', { name: location.name, pokemon: pokemonLabel, games: gamesLabel });

  return (
    <Pressable
      onPress={() => onPress(location)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {location.name}
        </Text>
        <View style={styles.badges}>
          <Badge
            label={pokemonLabel}
            background={colors.pokemonBadge}
            color={colors.pokemonBadgeText}
          />
          <Badge
            label={gamesLabel}
            background={colors.gamesBadge}
            color={colors.gamesBadgeText}
          />
          {!!region && <Badge label={region} background={colors.field} color={colors.textMuted} />}
        </View>
      </View>
      <Icon name="next" size={16} color={colors.textSubtle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: LOCATION_CARD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  name: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: colors.text,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
