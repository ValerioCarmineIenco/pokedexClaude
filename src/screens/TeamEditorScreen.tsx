import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PokemonPicker } from '@/components/compare/PokemonPicker';
import { ErrorState } from '@/components/ErrorState';
import { TeamEditorView } from '@/components/teams/TeamEditorView';
import {
  addTeamMember,
  deleteTeam,
  removeTeamMember,
  renameTeam,
  reorderTeam,
  useTeam,
} from '@/hooks/useTeams';

/** Dettaglio di una squadra (`/teams/[teamId]`), con la scelta dei Pokémon da aggiungere. */
export default function TeamEditorScreen() {
  const { t } = useTranslation('teams');
  const { teamId } = useLocalSearchParams<{ teamId?: string }>();
  const { team, isLoaded } = useTeam(teamId);
  const [picking, setPicking] = useState(false);
  const memberIds = useMemo(() => new Set(team?.members), [team?.members]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/teams'));

  if (!team) {
    // Il salvataggio si legge in un attimo: niente caricamento visibile.
    if (!isLoaded) return null;
    return (
      <ErrorState
        title={t('editor.notFoundTitle')}
        message={t('editor.notFoundMessage')}
        actionLabel={t('editor.backToTeams')}
        onAction={() => router.replace('/teams')}
      />
    );
  }

  if (picking) {
    return (
      <PokemonPicker
        title={t('editor.addTo', { name: team.name })}
        excludeIds={memberIds}
        onPick={(pokemon) => {
          addTeamMember(team.id, pokemon.id);
          setPicking(false);
        }}
        onClose={() => setPicking(false)}
      />
    );
  }

  return (
    <TeamEditorView
      key={team.id}
      team={team}
      onBack={goBack}
      onRename={(name) => renameTeam(team.id, name)}
      onAdd={() => setPicking(true)}
      onRemove={(pokemon) => removeTeamMember(team.id, pokemon.id)}
      onReorder={(ids) => reorderTeam(team.id, ids)}
      onOpenPokemon={(pokemon) =>
        router.push({ pathname: '/pokemon/[id]', params: { id: String(pokemon.id) } })
      }
      onDelete={() => {
        deleteTeam(team.id);
        goBack();
      }}
    />
  );
}
