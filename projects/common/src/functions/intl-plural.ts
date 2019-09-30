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

  return variants[type] ? variants[type].replace('{n}', value) : defaultValue.replace('{type}', type);
}
