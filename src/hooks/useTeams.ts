import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import { FIRST_POKEMON_ID, LAST_POKEMON_ID } from '@/api/pokemon';
import { TEAM_SIZE, type Team } from '@/types/team';

const STORAGE_KEY = 'pokedex.teams';

/**
 * Squadre del Team Builder: un solo elenco in memoria, letto da disco all'avvio e salvato a
 * ogni cambio (come `idSetStore` per preferiti e shiny).
 */
let teams: readonly Team[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function emit(next: readonly Team[]) {
  teams = next;
  listeners.forEach((listener) => listener());
}

function save(next: readonly Team[]) {
  emit(next);
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
}

const isPokemonId = (id: unknown): id is number =>
  Number.isInteger(id) && (id as number) >= FIRST_POKEMON_ID && (id as number) <= LAST_POKEMON_ID;

/** Scarta le voci salvate malformate invece di far cadere l'app. */
function parseTeams(saved: string | null): Team[] {
  if (!saved) return [];
  const raw = JSON.parse(saved);
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry): Team[] => {
    if (!entry || typeof entry.id !== 'string' || typeof entry.name !== 'string') return [];
    const members = Array.isArray(entry.members) ? entry.members.filter(isPokemonId) : [];
    return [{ id: entry.id, name: entry.name, members: [...new Set<number>(members)].slice(0, TEAM_SIZE) }];
  });
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((saved) => {
    const stored = parseTeams(saved);
    // Tiene anche le squadre create prima che la lettura finisse.
    const storedIds = new Set(stored.map((team) => team.id));
    loaded = true;
    emit([...stored, ...teams.filter((team) => !storedIds.has(team.id))]);
  })
  .catch(() => {
    loaded = true;
    emit(teams);
  });

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => teams;
const getLoaded = () => loaded;

function updateTeam(id: string, change: (team: Team) => Team) {
  save(teams.map((team) => (team.id === id ? change(team) : team)));
}

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Crea una squadra vuota («Squadra 1», «Squadra 2»…) e ne restituisce l'id. */
export function createTeam(): string {
  const names = new Set(teams.map((team) => team.name));
  let n = teams.length + 1;
  while (names.has(`Squadra ${n}`)) n += 1;
  const team: Team = { id: newId(), name: `Squadra ${n}`, members: [] };
  save([...teams, team]);
  return team.id;
}

/** Rinomina la squadra; un nome vuoto lascia quello di prima. */
export function renameTeam(id: string, name: string) {
  const trimmed = name.trim();
  if (trimmed) updateTeam(id, (team) => ({ ...team, name: trimmed }));
}

export function deleteTeam(id: string) {
  save(teams.filter((team) => team.id !== id));
}

/** Aggiunge il Pokémon in fondo, se c'è posto e non è già in squadra. */
export function addTeamMember(id: string, pokemonId: number) {
  updateTeam(id, (team) =>
    team.members.length >= TEAM_SIZE || team.members.includes(pokemonId)
      ? team
      : { ...team, members: [...team.members, pokemonId] },
  );
}

export function removeTeamMember(id: string, pokemonId: number) {
  updateTeam(id, (team) => ({ ...team, members: team.members.filter((member) => member !== pokemonId) }));
}

/** Nuovo ordine dei membri, dopo un trascinamento: deve contenere gli stessi Pokémon. */
export function reorderTeam(id: string, members: number[]) {
  updateTeam(id, (team) => {
    const same =
      members.length === team.members.length && members.every((member) => team.members.includes(member));
    return same ? { ...team, members } : team;
  });
}

/** Tutte le squadre, nell'ordine di creazione, ricordate tra un'apertura e l'altra. */
export function useTeams() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Una squadra per id. `isLoaded` è falso finché il salvataggio non è stato letto. */
export function useTeam(id: string | undefined) {
  const all = useTeams();
  const isLoaded = useSyncExternalStore(subscribe, getLoaded, getLoaded);
  return { team: all.find((team) => team.id === id), isLoaded };
}
