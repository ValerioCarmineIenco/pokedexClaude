import { useItemSearch } from '@/hooks/useItemSearch';

/**
 * Testo della barra di ricerca delle mosse e la sua versione «assestata», da passare a
 * `useMoves(query)`. Stesso comportamento della ricerca di oggetti, abilità e nature.
 *
 * Uso: `const search = useMoveSearch(); useMoves(search.query);`
 */
export const useMoveSearch = useItemSearch;
