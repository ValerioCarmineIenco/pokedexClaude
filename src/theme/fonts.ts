import { Anton_400Regular } from '@expo-google-fonts/anton';
import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';

/**
 * Famiglie di caratteri.
 *
 * Design 2.0 «Collezione»: Anton (`poster`) per titoli, nomi e numeri grandi, sempre in
 * maiuscolo; Space Grotesk (`ui*`) per tutto il resto. Le famiglie 1.x (Bricolage, DM Sans,
 * JetBrains Mono) restano finché le schermate non passano al nuovo stile, modulo per modulo.
 */
export const fonts = {
  poster: 'Anton_400Regular',
  ui: 'SpaceGrotesk_400Regular',
  uiMedium: 'SpaceGrotesk_500Medium',
  uiSemiBold: 'SpaceGrotesk_600SemiBold',
  uiBold: 'SpaceGrotesk_700Bold',
  display: 'BricolageGrotesque_600SemiBold',
  displayBold: 'BricolageGrotesque_800ExtraBold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
  mono: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

export function useAppFonts() {
  return useFonts({
    Anton_400Regular,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });
}
