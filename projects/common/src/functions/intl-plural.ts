import { hasOwnProperty } from './check-fn';

export function intlPlural (
  locale: string,
  value: number,
  variants: {
    one: string;
    few: string;
    many: string;
    other: string;
  },
  defaultValue = '[pluralization failed ({type})]',
): string {
  const type = new Intl.PluralRules(locale).select(value);

  return hasOwnProperty(variants, type)
    ? variants[type].replace('{n}', String(value))
    : defaultValue.replace('{type}', String(type));
}
