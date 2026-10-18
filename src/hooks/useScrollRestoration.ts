import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { Platform, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

/** FlashList e FlatList hanno `scrollToOffset`, ScrollView ha `scrollTo`. */
type Scrollable = {
  scrollToOffset?: (params: { offset: number; animated?: boolean }) => void;
  scrollTo?: (params: { y: number; animated?: boolean }) => void;
};

const RESTORE_TIMEOUT_MS = 1000;

/**
 * Riporta un elenco dove era quando si torna da una schermata aperta sopra (un dettaglio).
 *
 * Su iOS e Android la schermata resta montata e lo scorrimento si conserva da solo. Sul web
 * lo Stack nasconde le schermate coperte con `display: none` e il browser azzera lo scorrimento:
 * qui si ricorda l'ultima posizione e la si ripristina quando la schermata torna in primo piano.
 *
 * `const { ref, onScroll } = useScrollRestoration();` poi `<FlashList ref={ref} onScroll={onScroll} />`.
 * Con un gestore di scorrimento proprio (Reanimated) si passa la posizione a `onScrollOffset(y)`.
 * Un elenco nuovo (cambio di `key`, per vista o filtri) riparte dall'inizio.
 */
export function useScrollRestoration() {
  const instance = useRef<Scrollable | null>(null);
  const offset = useRef(0);
  const focused = useRef(true);
  // Posizione da raggiungere mentre si ripristina; null quando non si sta ripristinando.
  const restoring = useRef<number | null>(null);

  const ref = useCallback((node: Scrollable | null) => {
    if (node == null || node === instance.current) return;
    instance.current = node;
    offset.current = 0;
  }, []);

  const onScrollOffset = useCallback((y: number) => {
    if (restoring.current != null) {
      // Gli scorrimenti a 0 di quando l'elenco riappare non vanno ricordati.
      if (Math.abs(y - restoring.current) > 1) return;
      restoring.current = null;
    }
    if (focused.current) offset.current = y;
  }, []);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => onScrollOffset(event.nativeEvent.contentOffset.y),
    [onScrollOffset],
  );

  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      const y = offset.current;
      let frame: number | undefined;
      if (Platform.OS === 'web' && y > 0) {
        // La schermata torna visibile qualche frame dopo il focus (e l'elenco si rimisura):
        // si riprova a ogni frame finché l'elenco non segnala di essere arrivato, per al massimo un secondo.
        restoring.current = y;
        const deadline = Date.now() + RESTORE_TIMEOUT_MS;
        const step = () => {
          if (restoring.current == null) return;
          if (Date.now() > deadline) {
            restoring.current = null;
            return;
          }
          const list = instance.current;
          if (list?.scrollToOffset) list.scrollToOffset({ offset: y, animated: false });
          else list?.scrollTo?.({ y, animated: false });
          frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      }
      return () => {
        focused.current = false;
        restoring.current = null;
        if (frame != null) cancelAnimationFrame(frame);
      };
    }, []),
  );

  return { ref, onScroll, onScrollOffset };
}
