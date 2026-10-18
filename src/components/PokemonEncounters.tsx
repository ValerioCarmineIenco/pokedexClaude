import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { getVersionColor } from '@/theme/versionColors';
import type { PokemonEncounterGroup } from '@/types/location';

import { Icon } from './Icon';
import { SkeletonBlock } from './Skeleton';

export type PokemonEncountersProps = {
  groups: PokemonEncounterGroup[] | undefined;
  isLoading: boolean;
  errorMessage: string | null;
  pokemonName: string;
  onOpenLocation: (id: number) => void;
  onRetry: () => void;
};

/** «Dove trovarlo» nella scheda: per ogni gruppo di giochi, le località in cui si incontra. */
export function PokemonEncounters({
  groups,
  isLoading,
  errorMessage,
  pokemonName,
  onOpenLocation,
  onRetry,
}: PokemonEncountersProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        Dove trovarlo
      </Text>
      {groups && groups.length === 0 ? (
        <View style={styles.box}>
          <Text style={styles.emptyText}>
            {pokemonName} non si incontra in natura in nessun gioco: si ottiene evolvendo un altro
            Pokémon, da un uovo o con un evento speciale.
          </Text>
        </View>
      ) : groups ? (
        <View style={styles.groups}>
          {groups.map((group) => (
            <View key={group.versions.map((v) => v.id).join('-')} style={styles.box}>
              <View style={styles.versions}>
                {group.versions.map((version) => {
                  const color = getVersionColor(version.name);
                  return (
                    <View key={version.id} style={[styles.pill, { backgroundColor: color.background }]}>
                      <Text style={[styles.pillText, { color: color.text }]}>{version.label}</Text>
                    </View>
                  );
                })}
              </View>
              {group.locations.map((location) => {
                const methods = location.methods.map((m) => m.label).join(' · ');
                return (
                  <Pressable
                    key={location.id}
                    onPress={() => onOpenLocation(location.id)}
                    accessibilityRole="link"
                    accessibilityLabel={`${location.name}, ${methods}`}
                    accessibilityHint="Apre la località"
                    style={({ pressed }) => [styles.location, pressed && styles.pressed]}>
                    <Icon name="location" size={16} color={colors.textSubtle} />
                    <View style={styles.locationText}>
                      <Text style={styles.locationName}>{location.name}</Text>
                      {methods ? <Text style={styles.methods}>{methods}</Text> : null}
                    </View>
                    <Icon name="next" size={16} color={colors.textSubtle} />
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      ) : isLoading ? (
        <SkeletonBlock width="100%" height={96} radius={16} />
      ) : errorMessage ? (
        <View style={[styles.box, styles.error]}>
          <Text style={styles.emptyText}>{errorMessage}</Text>
          <Pressable
            onPress={onRetry}
            hitSlop={6}
            accessibilityRole="button"
            style={({ pressed }) => [styles.retry, pressed && styles.retryPressed]}>
            <Text style={styles.retryLabel}>Riprova</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  groups: {
    gap: 10,
  },
  box: {
    backgroundColor: colors.factBackground,
    borderRadius: 16,
    padding: 12,
    gap: 6,
  },
  versions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  pill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    lineHeight: 16,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
  locationText: {
    flex: 1,
    gap: 1,
  },
  locationName: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  methods: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  error: {
    gap: 10,
    alignItems: 'flex-start',
  },
  retry: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colors.text,
  },
  retryPressed: {
    opacity: 0.75,
  },
  retryLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.surface,
  },
});
