import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { getAdjacentIds } from '@/api/pokemon';
import { isDetailTab, type DetailTab } from '@/components/DetailTabs';
import { PokemonDetailView } from '@/components/PokemonDetailView';
import { useEvolutionChain } from '@/hooks/useEvolutionChain';
import { useFavorites } from '@/hooks/useFavorites';
import { usePokemonArtworks } from '@/hooks/usePokemonArtworks';
import { usePokemonDetail } from '@/hooks/usePokemonDetail';
import { usePokemonLearnset } from '@/hooks/usePokemonLearnset';
import { usePokemonTypeDefense } from '@/hooks/usePokemonTypeDefense';

export default function PokemonDetailScreen() {
  const { id: idParam, tab: tabParam } = useLocalSearchParams<{ id: string; tab?: string }>();
  const detail = usePokemonDetail(idParam);
  const [tab, setTab] = useState<DetailTab>(isDetailTab(tabParam) ? tabParam : 'info');
  // Galleria, catena e mosse si scaricano solo quando si apre la loro tab.
  const gallery = usePokemonArtworks(idParam, { enabled: tab === 'artwork' });
  const evolutions = useEvolutionChain(idParam, { enabled: tab === 'evolutions' });
  const learnset = usePokemonLearnset(idParam, { enabled: tab === 'moves' });
  const [favorites, toggleFavorite] = useFavorites();
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
      isFavorite={detail.id !== null && favorites.has(detail.id)}
      onToggleFavorite={() => detail.id !== null && toggleFavorite(detail.id)}
      onCompare={() =>
        detail.id !== null && router.push({ pathname: '/compare', params: { a: String(detail.id) } })
      }
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      onRetry={() => detail.refetch()}
      tab={tab}
      onTabChange={setTab}
      artworks={gallery.artworks}
      isArtworksLoading={gallery.isLoading}
      artworksErrorMessage={gallery.errorMessage}
      onArtworksRetry={() => void gallery.refetch()}
      evolutionChain={evolutions.chain}
      isEvolutionsLoading={evolutions.isLoading}
      evolutionsErrorMessage={evolutions.errorMessage}
      onEvolutionsRetry={() => void evolutions.refetch()}
      // Resta sulla tab Evoluzioni, così si può scorrere la catena da un membro all'altro.
      onOpenEvolution={(id) =>
        router.replace({ pathname: '/pokemon/[id]', params: { id: String(id), tab: 'evolutions' } })
      }
      onOpenItem={(id) => router.push({ pathname: '/items/[itemId]', params: { itemId: String(id) } })}
      onOpenLocation={(id) =>
        router.push({ pathname: '/locations/[locationId]', params: { locationId: String(id) } })
      }
      learnset={learnset.learnset}
      isLearnsetLoading={learnset.isLoading}
      learnsetErrorMessage={learnset.errorMessage}
      onLearnsetRetry={() => void learnset.refetch()}
      onOpenMove={(move) =>
        router.push({ pathname: '/moves/[moveId]', params: { moveId: String(move.id) } })
      }
      typeDefense={typeDefense.groups}
      isTypeDefenseLoading={typeDefense.isLoading}
      typeDefenseErrorMessage={typeDefense.errorMessage}
      onTypeDefenseRetry={() => void typeDefense.refetch()}
    />
  );
}
