import { FIRST_POKEMON_ID, LAST_POKEMON_ID } from '@/api/pokemon';
import { getFavorites, replaceFavorites } from '@/hooks/useFavorites';
import { getShinyCaught, replaceShinyCaught } from '@/hooks/useShinyCaught';
import { getTeams, replaceTeams, sanitizeTeams } from '@/hooks/useTeams';
import type { Team } from '@/types/team';

const BACKUP_APP = 'pokedex';
const BACKUP_VERSION = 1;

/** Contenuto del file di backup: preferiti, shiny ottenuti e squadre. */
export type Backup = {
  app: typeof BACKUP_APP;
  version: number;
  exportedAt: string;
  favorites: number[];
  shinyCaught: number[];
  teams: Team[];
};

/** Errore con un messaggio già pronto da mostrare all'utente. */
export class BackupError extends Error {}

const sortedIds = (ids: ReadonlySet<number>) => [...ids].sort((a, b) => a - b);

/** Nome del file, con la data: `pokedex-backup-2026-10-18.json`. */
export function backupFileName(date = new Date()): string {
  return `pokedex-backup-${date.toISOString().slice(0, 10)}.json`;
}

/** Fotografia dei dati salvati, come testo JSON leggibile. */
export function createBackup(): string {
  const backup: Backup = {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    favorites: sortedIds(getFavorites()),
    shinyCaught: sortedIds(getShinyCaught()),
    teams: [...getTeams()],
  };
  return JSON.stringify(backup, null, 2);
}

const isPokemonId = (id: unknown): id is number =>
  Number.isInteger(id) && (id as number) >= FIRST_POKEMON_ID && (id as number) <= LAST_POKEMON_ID;

const pokemonIds = (raw: unknown): number[] =>
  Array.isArray(raw) ? [...new Set(raw.filter(isPokemonId))] : [];

/** Legge e controlla un file di backup; le voci malformate vengono scartate. */
export function parseBackup(text: string): Omit<Backup, 'exportedAt'> {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new BackupError('Il file non è un backup valido.');
  }
  if (!raw || typeof raw !== 'object' || (raw as Backup).app !== BACKUP_APP) {
    throw new BackupError('Il file non è un backup di questa app.');
  }
  const backup = raw as Partial<Backup>;
  if (typeof backup.version !== 'number' || backup.version > BACKUP_VERSION) {
    throw new BackupError("Il backup è stato creato da una versione più recente dell'app.");
  }
  return {
    app: BACKUP_APP,
    version: backup.version,
    favorites: pokemonIds(backup.favorites),
    shinyCaught: pokemonIds(backup.shinyCaught),
    teams: sanitizeTeams(backup.teams),
  };
}

/** Sostituisce preferiti, shiny e squadre con quelli del backup. */
export function restoreBackup(text: string) {
  const backup = parseBackup(text);
  replaceFavorites(backup.favorites);
  replaceShinyCaught(backup.shinyCaught);
  replaceTeams(backup.teams);
  return {
    favorites: backup.favorites.length,
    shinyCaught: backup.shinyCaught.length,
    teams: backup.teams.length,
  };
}
