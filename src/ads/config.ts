import { Platform } from 'react-native';

/**
 * Configurazione della pubblicità (AdMob), tutta in questo file.
 *
 * Per ora ci sono solo gli ID di prova di Google: mostrano annunci finti con la
 * scritta «Test Ad» e non generano entrate. Per andare online sostituisci:
 * - gli ID delle unità pubblicitarie qui sotto (`ca-app-pub-…/…`);
 * - gli ID dell'app (`ca-app-pub-…~…`) in `app.json`, opzioni del plugin
 *   `react-native-google-mobile-ads` (lì devono stare perché finiscono nei file nativi).
 */
const TEST_UNIT_IDS = {
  banner: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2435281174',
    default: 'ca-app-pub-3940256099942544/9214589741',
  }),
  interstitial: Platform.select({
    ios: 'ca-app-pub-3940256099942544/4411468910',
    default: 'ca-app-pub-3940256099942544/1033173712',
  }),
};

export const adsConfig = {
  /** Interruttore generale: `false` toglie banner e interstiziali. */
  enabled: true,
  unitIds: TEST_UNIT_IDS,
  interstitial: {
    /** Tempo passato nell'app (in primo piano) dopo cui mostrare un interstiziale. */
    afterActiveMs: 30 * 60 * 1000,
    /** Schede dettaglio aperte dopo cui mostrare un interstiziale. */
    afterDetailViews: 30,
  },
  /**
   * Rotte che contano come scheda dettaglio, nella forma di `useSegments()`
   * unita da «/». Anche il passaggio al Pokémon precedente/successivo conta.
   */
  detailRoutes: [
    'pokemon/[id]',
    'items/[itemId]',
    'abilities/[abilityId]',
    'moves/[moveId]',
    'locations/[locationId]',
    'types/[typeId]',
  ],
};
