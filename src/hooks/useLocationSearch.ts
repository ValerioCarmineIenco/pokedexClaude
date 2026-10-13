import { useItemSearch } from '@/hooks/useItemSearch';

/**
 * Testo della barra di ricerca delle località e la sua versione «assestata», da passare a
 * `useLocations({ search: query })`. Stesso comportamento delle altre ricerche.
 *
 * Uso: `const search = useLocationSearch(); useLocations({ region, search: search.query });`
 */
export const useLocationSearch = useItemSearch;
