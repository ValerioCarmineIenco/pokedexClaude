import { router } from 'expo-router';

import { createTeam, useTeams } from '@/hooks/useTeams';

import { TeamListView } from './TeamListView';

const openTeam = (teamId: string) => router.push({ pathname: '/teams/[teamId]', params: { teamId } });

/** Schermata della sezione Squadre, pronta da montare in una rotta. */
export function TeamListScreen() {
  const teams = useTeams();
  return (
    <TeamListView
      teams={teams}
      onCreate={() => openTeam(createTeam())}
      onOpen={(team) => openTeam(team.id)}
    />
  );
}
