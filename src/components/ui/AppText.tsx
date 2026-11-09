import { Text, type TextProps } from 'react-native';

import { colors } from '@/theme/colors';
import { typography, type TypographyVariant } from '@/theme/typography';

type Props = TextProps & {
  variant?: TypographyVariant;
  /** Colore del testo; di base quello principale del tema. */
  color?: string;
};

/** Testo del design «Collezione»: uno stile della scala tipografica e un colore. */
export function AppText({ variant = 'body', color, style, ...rest }: Props) {
  return <Text {...rest} style={[typography[variant], { color: color ?? colors.text }, style]} />;
}
