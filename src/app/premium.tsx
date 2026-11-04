import { router } from 'expo-router';

import { PremiumView } from '@/components/settings/PremiumView';

export default function PremiumScreen() {
  return <PremiumView onBack={() => (router.canGoBack() ? router.back() : router.replace('/settings'))} />;
}
