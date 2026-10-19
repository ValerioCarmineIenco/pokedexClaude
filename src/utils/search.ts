/**
 * Toglie maiuscole, accenti e spazi ai bordi, così «PIKA» trova «pikachu» e «pozióne» «Pozione».
 * Hiragana e katakana valgono uguali: «ぴかちゅう» trova «ピカチュウ».
 */
export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u3041-\u3096]/g, (kana) => String.fromCharCode(kana.charCodeAt(0) + 0x60))
    .toLowerCase()
    .trim();
}
