import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { intlPlural } from '../../functions/intl-plural';

@Pipe({ name: 'plural' })
export class PluralPipe implements PipeTransform
{
  public constructor (@Inject(LOCALE_ID) private locale: string) {}

  public transform (
    value: number,
    one: string,
    few: string,
    many: string,
    other: string,
    defaultValue = '[pluralization failed ({type})]',
    locale?: string,
  ): string {
    return intlPlural(locale || this.locale, value, { one, few, many, other }, defaultValue);
  }
}
