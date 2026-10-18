import { Image } from 'expo-image';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getArtworkUrl } from '@/api/pokemon';
import { useArtworkStyle } from '@/hooks/useArtworkStyle';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { TYPE_LABELS } from '@/theme/typeNames';
import { TEAM_SIZE, type Team } from '@/types/team';
import { analyzeTeam, getTeamMembers } from '@/utils/teamAnalysis';

import { ErrorState } from '../ErrorState';
import { Icon } from '../Icon';
import { SectionTitle } from '../SectionTitle';

export type TeamListViewProps = {
  teams: readonly Team[];
  onCreate: () => void;
  onOpen: (team: Team) => void;
};

/** Sezione Squadre: le squadre salvate e il pulsante per crearne una nuova. */
export function TeamListView({ teams, onCreate, onOpen }: TeamListViewProps) {
  const { t } = useTranslation('teams');
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <SectionTitle section="teams" />
        <Pressable
          onPress={onCreate}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={t('list.newA11y')}
          style={({ pressed }) => [styles.newButton, pressed && styles.pressed]}>
          <Icon name="plus" size={16} color={colors.surface} />
          <Text style={styles.newLabel}>{t('list.new')}</Text>
        </Pressable>
      </View>
      <FlatList
        data={teams}
        keyExtractor={(team) => team.id}
        renderItem={({ item }) => <TeamCard team={item} onPress={() => onOpen(item)} />}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        ListEmptyComponent={
          <ErrorState
            title={t('list.emptyTitle')}
            message={t('list.emptyMessage', { size: TEAM_SIZE })}
            glyph="+"
            actionLabel={t('list.emptyAction')}
            onAction={onCreate}
          />
        }
      />
    </View>
  );
}

function TeamCard({ team, onPress }: { team: Team; onPress: () => void }) {
  const { t } = useTranslation('teams');
  const [artworkStyle] = useArtworkStyle();
  const members = useMemo(() => getTeamMembers(team.members), [team.members]);
  const worst = useMemo(() => analyzeTeam(members).sharedWeaknesses[0], [members]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('list.cardA11y', { name: team.name, count: members.length, size: TEAM_SIZE })}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.cardHead}>
        <Text style={styles.cardName} numberOfLines={1}>
          {team.name}
        </Text>
        <Text style={styles.cardCount}>
          {members.length}/{TEAM_SIZE}
        </Text>
      </View>
      <View style={styles.slots}>
        {Array.from({ length: TEAM_SIZE }, (_, index) => {
          const member = members[index];
          return (
            <View key={member?.id ?? `empty-${index}`} style={styles.slot}>
              {member && (
                <Image
                  source={getArtworkUrl(member.id, artworkStyle)}
                  style={styles.slotArt}
                  contentFit="contain"
                  transition={150}
                />
              )}
            </View>
          );
        })}
      </View>
      <Text style={styles.cardHint} numberOfLines={1}>
        {members.length === 0
          ? t('list.cardEmpty')
          : worst
            ? t('list.cardWeak', { count: worst.weak, type: TYPE_LABELS[worst.type] })
            : t('list.cardNoWeakness')}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 12,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.accent,
  },
  pressed: {
    opacity: 0.75,
  },
  newLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.surface,
  },
  list: {
    paddingHorizontal: 16,
    gap: 12,
    flexGrow: 1,
  },
  card: {
    borderRadius: 18,
    padding: 14,
    gap: 10,
    backgroundColor: colors.surface,
  },
  cardPressed: {
    opacity: 0.8,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  cardName: {
    flex: 1,
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.text,
  },
  cardCount: {
    fontFamily: fonts.monoBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  slots: {
    flexDirection: 'row',
    gap: 6,
  },
  slot: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: colors.factBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotArt: {
    width: '86%',
    height: '86%',
  },
  cardHint: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
});
