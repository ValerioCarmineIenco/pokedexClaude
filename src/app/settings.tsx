import { SettingsView } from '@/components/SettingsView';
import { useArtworkStyle } from '@/hooks/useArtworkStyle';

export default function SettingsScreen() {
  const [artworkStyle, setArtworkStyle] = useArtworkStyle();
  return <SettingsView artworkStyle={artworkStyle} onArtworkStyleChange={setArtworkStyle} />;
}
