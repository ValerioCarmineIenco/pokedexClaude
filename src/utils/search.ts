/** Toglie maiuscole, accenti e spazi ai bordi, così «PIKA» trova «pikachu» e «pozióne» «Pozione». */
export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
