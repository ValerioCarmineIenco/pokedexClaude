/** Numero massimo di Pokémon in una squadra. */
export const TEAM_SIZE = 6;

/** Una squadra salvata sul dispositivo. */
export type Team = {
  id: string;
  name: string;
  /** Id nazionali dei Pokémon, nell'ordine scelto (al massimo `TEAM_SIZE`). */
  members: number[];
};
