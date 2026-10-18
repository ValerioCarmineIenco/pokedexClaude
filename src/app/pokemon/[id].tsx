import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { getAdjacentIds } from '@/api/pokemon';
import type { DetailTab } from '@/components/DetailTabs';
import { PokemonDetailView } from '@/components/PokemonDetailView';
import { usePokemonArtworks } from '@/hooks/usePokemonArtworks';
import { usePokemonDetail } from '@/hooks/usePokemonDetail';
import { usePokemonTypeDefense } from '@/hooks/usePokemonTypeDefense';

export default function PokemonDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const detail = usePokemonDetail(idParam);
  const [tab, setTab] = useState<DetailTab>('info');
  // La galleria si scarica solo quando si apre la tab Artwork.
  const gallery = usePokemonArtworks(idParam, { enabled: tab === 'artwork' });
  const typeDefense = usePokemonTypeDefense(detail.pokemon?.types);
  const { previous, next } =
    detail.id === null ? { previous: null, next: null } : getAdjacentIds(detail.id);

  return (
    <PokemonDetailView
      pokemon={detail.pokemon}
      isLoading={detail.isLoading}
      isDescriptionLoading={detail.isDescriptionLoading}
      errorMessage={detail.errorMessage}
      isInvalidId={detail.isInvalidId}
      previousId={previous}
      nextId={next}
      // Sostituisce la scheda invece di impilarla: "Indietro" torna sempre all'elenco.
      onNavigate={(id) => router.replace({ pathname: '/pokemon/[id]', params: { id: String(id) } })}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      onRetry={() => detail.refetch()}
      tab={tab}
      onTabChange={setTab}
      artworks={gallery.artworks}
      isArtworksLoading={gallery.isLoading}
      artworksErrorMessage={gallery.errorMessage}
      onArtworksRetry={() => void gallery.refetch()}
      typeDefense={typeDefense.groups}
      isTypeDefenseLoading={typeDefense.isLoading}
      typeDefenseErrorMessage={typeDefense.errorMessage}
      onTypeDefenseRetry={() => void typeDefense.refetch()}
    />
  );
}
