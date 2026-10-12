import { router } from 'expo-router';

import { SettingsView } from '@/components/SettingsView';
import { useArtworkStyle } from '@/hooks/useArtworkStyle';

export default function SettingsScreen() {
  const [artworkStyle, setArtworkStyle] = useArtworkStyle();
  return (
    <SettingsView
      artworkStyle={artworkStyle}
      onArtworkStyleChange={setArtworkStyle}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
    />
  );
}
