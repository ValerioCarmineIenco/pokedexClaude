import { Image } from 'expo-image';

import type { AppIcon } from '@/purchases/appIcon';

/** Anteprima di un'icona dell'app, con gli angoli già arrotondati come sulla schermata Home. */
export function AppIconPreview({ icon, size = 60 }: { icon: AppIcon; size?: number }) {
  return <Image source={icon.preview} style={{ width: size, height: size }} contentFit="contain" />;
}
