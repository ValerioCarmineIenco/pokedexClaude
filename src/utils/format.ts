/** `25` → `#025` */
export function formatPokemonNumber(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

/** `bulbasaur` → `Bulbasaur` */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** `solar-power` → `Solar Power` */
export function formatSlug(value: string): string {
  return value.split('-').map(capitalize).join(' ');
}

/** `0.7` → `0,7 m` */
export function formatHeight(meters: number): string {
  return `${meters.toLocaleString('it-IT')} m`;
}

/** `6.9` → `6,9 kg` */
export function formatWeight(kilograms: number): string {
  return `${kilograms.toLocaleString('it-IT')} kg`;
}
