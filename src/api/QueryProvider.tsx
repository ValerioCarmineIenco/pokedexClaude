import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import type { ReactNode } from 'react';

import { CACHE_MAX_AGE, queryClient, queryPersister } from '@/api/queryClient';

/** Provider di React Query con la cache salvata in AsyncStorage. */
export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: queryPersister, maxAge: CACHE_MAX_AGE, buster: 'v1' }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
