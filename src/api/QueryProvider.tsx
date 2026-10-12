import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import type { ReactNode } from 'react';

import { CACHE_MAX_AGE, queryClient, queryPersister } from '@/api/queryClient';

/**
 * Provider di React Query con la cache salvata in AsyncStorage.
 * Il `buster` scarta la cache della v1, i cui Pokémon non hanno `generation`.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: queryPersister, maxAge: CACHE_MAX_AGE, buster: 'v2' }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
