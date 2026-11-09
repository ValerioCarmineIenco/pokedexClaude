import type { TextStyle } from 'react-native';

import { fonts } from './fonts';

/**
 * Scala tipografica del design «Collezione». Solo forma del testo, niente colori: il colore
 * lo sceglie chi usa lo stile (di solito `colors.text` o `colors.textMuted`).
 *
 * Anton ha lettere molto alte e strette: l'interlinea resta vicina alla dimensione, e i titoli
 * sono sempre in maiuscolo.
 */
export const typography = {
  /** Titolo di schermata: «POKÉDEX», «SQUADRE», «ALTRO». */
  hero: { fontFamily: fonts.poster, fontSize: 64, lineHeight: 66, textTransform: 'uppercase' },
  /** Nome grande nella scheda di un Pokémon. */
  title: { fontFamily: fonts.poster, fontSize: 44, lineHeight: 48, textTransform: 'uppercase' },
  /** Nome sulle carte e titoli dei riquadri. */
  heading: { fontFamily: fonts.poster, fontSize: 30, lineHeight: 34, textTransform: 'uppercase' },
  /** Titolo di sezione dentro una schermata: «COLORI». */
  section: { fontFamily: fonts.poster, fontSize: 22, lineHeight: 26, textTransform: 'uppercase' },
  /** Numeri delle statistiche. */
  stat: { fontFamily: fonts.poster, fontSize: 26, lineHeight: 30 },
  /** Etichette in maiuscoletto: tipi, chip, «COPERTURE FORTI». */
  label: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  /** Titolo di una riga d'elenco o di un pulsante. */
  bodyStrong: { fontFamily: fonts.uiSemiBold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.ui, fontSize: 15, lineHeight: 21 },
  /** Righe secondarie, dati piccoli. */
  caption: { fontFamily: fonts.uiMedium, fontSize: 13, lineHeight: 18 },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
