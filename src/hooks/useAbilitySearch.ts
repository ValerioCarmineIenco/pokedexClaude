import { useItemSearch } from '@/hooks/useItemSearch';

/**
 * Testo della barra di ricerca delle abilità e la sua versione «assestata», da passare a
 * `useAbilities(query)`. Stesso comportamento della ricerca degli oggetti.
 *
 * Uso: `const search = useAbilitySearch(); useAbilities(search.query);`
 */
export const useAbilitySearch = useItemSearch;
