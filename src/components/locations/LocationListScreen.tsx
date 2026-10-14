import { router, type Href } from 'expo-router';
import { useState } from 'react';

import { useLocationSearch } from '@/hooks/useLocationSearch';
import { useLocations } from '@/hooks/useLocations';

import { LocationListView } from './LocationListView';

/** Schermata elenco località, pronta da montare in una rotta. */
export function LocationListScreen() {
  const search = useLocationSearch();
  const [region, setRegion] = useState<string | null>(null);
  const list = useLocations({ region, search: search.query });

  return (
    <LocationListView
      locations={list.locations}
      regions={list.regions}
      region={region}
      onRegionChange={setRegion}
      searchText={search.text}
      onSearchTextChange={search.setText}
      onOpenSettings={() => router.push('/settings')}
      onLocationPress={(location) =>
        // Rotta del dettaglio: src/app/locations/[locationId].tsx.
        router.push(`/locations/${location.id}` as Href)
      }
    />
  );
}
