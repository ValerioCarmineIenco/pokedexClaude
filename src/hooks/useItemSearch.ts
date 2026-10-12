import { useEffect, useState } from 'react';

const DEBOUNCE_MS = 250;

/**
 * Testo della barra di ricerca degli oggetti e la sua versione «assestata», da passare a
 * `useItems(category, query)`: così non si scarica una pagina a ogni lettera digitata.
 *
 * Uso: `const search = useItemSearch(); useItems(category, search.query);`
 */
export function useItemSearch() {
  const [text, setText] = useState('');
  const [settled, setSettled] = useState('');
  const isSearching = text.trim().length > 0;

  useEffect(() => {
    const timer = setTimeout(() => setSettled(text), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  return {
    /** Valore della barra di ricerca. */
    text,
    setText,
    /** Testo da cercare, aggiornato dopo una breve pausa di digitazione. */
    // Svuotare la barra mostra subito l'elenco completo, senza attendere.
    query: isSearching ? settled : '',
    isSearching,
  };
}
