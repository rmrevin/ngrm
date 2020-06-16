import { isString } from './check-fn';

export function moneyFormat (
  value: number | string,
  withFraction: boolean = false,
  currency: string = 'RUB',
  locale: string = 'ru-RU',
): string {

  value = isString(value) ? parseFloat(value) : value;

  const showFraction = withFraction || value % 1 !== 0;

  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: showFraction ? 2 : 0,
    maximumFractionDigits: showFraction ? 2 : 0,
  };

  return value || value === 0 ? value.toLocaleString(locale, options) : '';
}
