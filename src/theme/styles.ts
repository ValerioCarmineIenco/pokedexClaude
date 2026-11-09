import { StyleSheet } from 'react-native';

import { getActiveTheme } from './colors';

/**
 * Come `StyleSheet.create`, ma per stili che usano i colori del tema: la funzione si richiama
 * (una volta sola) a ogni cambio di tema, al primo accesso a uno stile.
 *
 *   const styles = themedStyles(() => ({ title: { color: colors.text } }));
 */
export function themedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: () => T & StyleSheet.NamedStyles<T>,
): T {
  let themeId: string | null = null;
  let cache = {} as T;
  const current = () => {
    const theme = getActiveTheme();
    if (theme.id !== themeId) {
      cache = StyleSheet.create(factory());
      themeId = theme.id;
    }
    return cache;
  };
  return new Proxy({} as T, {
    get: (_, key) => current()[key as keyof T],
    has: (_, key) => key in current(),
    ownKeys: () => Reflect.ownKeys(current()),
    getOwnPropertyDescriptor: (_, key) => Object.getOwnPropertyDescriptor(current(), key),
  });
}
