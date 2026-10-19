import 'i18next';

import type { resources } from './resources';

// Chiavi tipizzate: `t('moves:detail.power')` con una chiave che non esiste in inglese non compila.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: (typeof resources)['en'];
  }
}
