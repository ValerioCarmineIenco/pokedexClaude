import { useIsFocused } from 'expo-router';
import { useState, type ReactElement } from 'react';

/**
 * Disegna una schermata solo dalla prima volta che viene mostrata (solo sul web).
 *
 * Sul web lo Stack tiene montate le schermate coperte con `display: none`. Se una schermata
 * nasce già coperta (al cambio di tema `ThemeGate` rimonta tutto lo Stack sotto la schermata
 * Temi, oppure aprendo direttamente l'indirizzo di un dettaglio), i suoi elenchi si misurano
 * alti 0: FlashList non riempie mai lo schermo e continua ad aggiungere celle in sottofondo,
 * centinaia per ogni cambio di tema, e tutta l'app rallenta. Qui la schermata coperta resta
 * vuota finché non torna in primo piano, quando si disegna con le misure vere.
 */
export function MountWhenFocused({ children }: { children: ReactElement }) {
  const focused = useIsFocused();
  const [shown, setShown] = useState(focused);
  if (focused && !shown) setShown(true);
  return shown ? children : null;
}
