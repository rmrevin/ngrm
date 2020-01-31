export function numberFormat (value: number, locale: string = 'ru-RU'): string {
  const withFraction = value % 1 !== 0;

  const options: Intl.NumberFormatOptions = {
    style: 'decimal',
    minimumFractionDigits: withFraction ? 2 : 0,
    maximumFractionDigits: withFraction ? 2 : 0,
  };

  return value.toLocaleString(locale, options);
}
