import { router } from 'expo-router';

import { ThemesView } from '@/components/settings/ThemesView';

export default function ThemesScreen() {
  return (
    <ThemesView
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/settings'))}
      onUnlock={() => router.push('/premium')}
    />
  );
}
