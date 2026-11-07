/**
 * Colori dei riquadri delle sezioni (schermata Altro del design «Collezione»). Come i colori dei
 * tipi, restano uguali in tutti i temi: la sfumatura verso il basso la calcola il tema.
 */
export const SECTION_COLORS = {
  items: '#D9361A',
  abilities: '#5866D6',
  natures: '#38A673',
  locations: '#E8862A',
  types: '#9B5BE0',
  compare: '#2775D6',
} as const;

export type SectionColorName = keyof typeof SECTION_COLORS;
