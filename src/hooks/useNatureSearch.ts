import { useItemSearch } from '@/hooks/useItemSearch';

/**
 * Testo della barra di ricerca delle nature e la sua versione «assestata», da passare a
 * `useNatures(query)`. Stesso comportamento della ricerca di oggetti e abilità.
 *
 * Uso: `const search = useNatureSearch(); useNatures(search.query);`
 */
export const useNatureSearch = useItemSearch;
