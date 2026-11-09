import { Redirect, router } from 'expo-router';

import { DesignCatalogView } from '@/components/ui/DesignCatalogView';

/** Catalogo dei componenti del design 2.0: solo in sviluppo, nelle build pubblicate porta all'elenco. */
export default function DesignScreen() {
  if (!__DEV__) return <Redirect href="/" />;
  return <DesignCatalogView onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))} />;
}
