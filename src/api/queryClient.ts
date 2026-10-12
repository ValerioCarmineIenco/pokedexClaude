import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/client';

/** Quanto resta valida la cache salvata su disco. */
export const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 giorni

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // I dati di PokéAPI non cambiano.
      staleTime: Infinity,
      // Deve essere >= maxAge, altrimenti il persister salva una cache già svuotata.
      gcTime: CACHE_MAX_AGE,
      // Un 404 non migliora riprovando.
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.isNotFound) && failureCount < 2,
    },
  },
});

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'pokedex-query-cache',
});
