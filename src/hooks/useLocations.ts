import { useMemo } from 'react';

import { getLocationRegions, getLocations, getLocationSections } from '@/api/locations';

/**
 * Elenco delle località, in ordine alfabetico, filtrato per regione (slug, es. `kanto`;
 * null = tutte) e per nome (`search`, vedi `useLocationSearch`). Tutto viene dall'indice
 * locale, compresi i contatori di Pokémon e giochi: niente rete, niente caricamento.
 *
 * `sections` raggruppa le località per regione, per un elenco con intestazioni quando non
 * si filtra per regione.
 */
export function useLocations({ region = null, search = '' }: { region?: string | null; search?: string } = {}) {
  const locations = useMemo(() => getLocations({ region, search }), [region, search]);
  const sections = useMemo(() => getLocationSections(search), [search]);

  return {
    locations,
    sections,
    /** Regioni da offrire nel selettore, in ordine (Kanto, Johto, Hoenn…). */
    regions: getLocationRegions(),
    total: locations.length,
  };
}
