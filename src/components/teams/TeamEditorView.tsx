import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t as translate } from '@/i18n';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { TEAM_SIZE, type Team } from '@/types/team';
import type { PokemonSummary } from '@/types/pokemon';
import { analyzeTeam, formatTeamText, getTeamMembers } from '@/utils/teamAnalysis';

import { Icon } from '../Icon';

import { TeamAnalysisSection } from './TeamAnalysisSection';
import { TeamSlots } from './TeamSlots';

export type TeamEditorViewProps = {
  team: Team;
  onBack: () => void;
  onRename: (name: string) => void;
  onAdd: () => void;
  onRemove: (pokemon: PokemonSummary) => void;
  onReorder: (ids: number[]) => void;
  onOpenPokemon: (pokemon: PokemonSummary) => void;
  onDelete: () => void;
};

/** Condivide il testo della squadra; sul web senza `navigator.share` lo copia negli appunti. */
async function shareText(message: string): Promise<string | null> {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
    await navigator.clipboard.writeText(message);
    return translate('teams:editor.copied');
  }
  await Share.share({ message });
  return null;
}

/**
 * Una squadra: nome modificabile, i 6 posti riordinabili, copertura di tipo e condivisione.
 * La radice dei gesti sta qui, l'unica schermata che trascina, senza toccare il layout.
 */
export function TeamEditorView({
  team,
  onBack,
  onRename,
  onAdd,
  onRemove,
  onReorder,
  onOpenPokemon,
  onDelete,
}: TeamEditorViewProps) {
  const { t } = useTranslation('teams');
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(team.name);
  const [dragging, setDragging] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const members = useMemo(() => getTeamMembers(team.members), [team.members]);
  const analysis = useMemo(() => analyzeTeam(members), [members]);
  const free = TEAM_SIZE - members.length;

  const share = () => {
    shareText(formatTeamText(team.name, members))
      .then(setNotice)
      .catch(() => setNotice(t('editor.shareFailed')));
  };

  return (
    <GestureHandlerRootView style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable
          onPress={onBack}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={t('editor.back')}
          style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}>
          <Icon name="back" size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.notice} numberOfLines={1} accessibilityLiveRegion="polite">
          {notice ?? ''}
        </Text>
        <Pressable
          onPress={share}
          disabled={members.length === 0}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={t('editor.share')}
          accessibilityState={{ disabled: members.length === 0 }}
          style={({ pressed }) => [
            styles.navButton,
            pressed && styles.pressed,
            members.length === 0 && styles.disabled,
          ]}>
          <Icon name="share" size={18} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        scrollEnabled={!dragging}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 28 }]}>
        <TextInput
          value={name}
          onChangeText={setName}
          onBlur={() => {
            onRename(name);
            if (!name.trim()) setName(team.name);
          }}
          onSubmitEditing={() => onRename(name)}
          returnKeyType="done"
          maxLength={40}
          accessibilityLabel={t('editor.nameLabel')}
          placeholder={t('editor.nameLabel')}
          placeholderTextColor={colors.textSubtle}
          style={styles.name}
        />
        <Text style={styles.caption}>
          {members.length > 1
            ? t('editor.captionDrag', { count: members.length, size: TEAM_SIZE })
            : t('editor.caption', { count: members.length, size: TEAM_SIZE })}
        </Text>

        <TeamSlots
          members={members}
          onReorder={onReorder}
          onRemove={onRemove}
          onOpen={onOpenPokemon}
          onDragChange={setDragging}
        />

        {free > 0 && (
          <Pressable
            onPress={onAdd}
            accessibilityRole="button"
            style={({ pressed }) => [styles.add, pressed && styles.addPressed]}>
            <Icon name="plus" size={18} color={colors.accent} />
            <Text style={styles.addLabel}>
              {free < TEAM_SIZE ? t('editor.addFree', { count: free }) : t('editor.add')}
            </Text>
          </Pressable>
        )}

        <TeamAnalysisSection analysis={analysis} size={members.length} />

        <Pressable
          onPress={() => (confirmDelete ? onDelete() : setConfirmDelete(true))}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.delete,
            confirmDelete && styles.deleteConfirm,
            pressed && styles.addPressed,
          ]}>
          <Icon name="trash" size={16} color={confirmDelete ? colors.surface : colors.statDown} />
          <Text style={[styles.deleteLabel, confirmDelete && styles.deleteLabelConfirm]}>
            {confirmDelete ? t('editor.confirmDelete') : t('editor.delete')}
          </Text>
        </Pressable>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 12,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: 'rgba(29, 28, 34, 0.08)',
  },
  disabled: {
    opacity: 0.35,
  },
  body: {
    paddingHorizontal: 16,
    gap: 14,
  },
  name: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    letterSpacing: -0.4,
    color: colors.text,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  caption: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: -4,
  },
  notice: {
    flex: 1,
    textAlign: 'right',
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.statUp,
  },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  addPressed: {
    opacity: 0.7,
  },
  addLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.accent,
  },
  delete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  deleteConfirm: {
    backgroundColor: colors.statDown,
  },
  deleteLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.statDown,
  },
  deleteLabelConfirm: {
    color: colors.surface,
  },
});
