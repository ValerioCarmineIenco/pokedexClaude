type Options = { afterActiveMs: number; afterDetailViews: number };

/**
 * Decide quando è ora di un interstiziale: dopo `afterActiveMs` di permanenza
 * nell'app (il tempo in background non conta) oppure dopo `afterDetailViews`
 * schede dettaglio, il primo dei due. `reset` azzera entrambi.
 */
export function createInterstitialPolicy(
  { afterActiveMs, afterDetailViews }: Options,
  now: number
) {
  let activeMs = 0;
  let activeSince: number | null = now;
  let detailViews = 0;

  const elapsed = (at: number) => activeMs + (activeSince === null ? 0 : at - activeSince);

  return {
    /** L'app va in background: il tempo si ferma. */
    pause(at: number) {
      if (activeSince === null) return;
      activeMs += at - activeSince;
      activeSince = null;
    },
    /** L'app torna in primo piano: il tempo riparte. */
    resume(at: number) {
      if (activeSince === null) activeSince = at;
    },
    recordDetailView() {
      detailViews += 1;
    },
    isDue(at: number) {
      return detailViews >= afterDetailViews || elapsed(at) >= afterActiveMs;
    },
    reset(at: number) {
      activeMs = 0;
      detailViews = 0;
      if (activeSince !== null) activeSince = at;
    },
  };
}
