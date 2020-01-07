import { hashCode } from './hash-code';
import { ruPpuntoSwitcher } from './punto-switcher-ru-en';
import { safeRegexpString } from './safe-regexp-string';

const cache: { [key: number]: RegExp } = {};

export function createSearchRegExp (query: string): RegExp {
  const safeQuery = safeRegexpString(query);

  const safePuntoQuery = safeRegexpString(ruPpuntoSwitcher(query));

  const pattern = `(${safeQuery}|${safePuntoQuery})`;

  const hash = hashCode(pattern);

  if (typeof cache[hash] === 'undefined') {
    cache[hash] = new RegExp(pattern, 'iu');
  }

  return cache[hash];
}
