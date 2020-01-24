import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { moneyFormat } from '../../functions';

@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform
{
  public constructor (@Inject(LOCALE_ID) private locale: string = 'ru-RU') {}

  public transform (value: number, withFraction: boolean = false, currency: string = 'RUB', locale?: string): string {
    return moneyFormat(value, withFraction, currency, locale || this.locale);
  }
}
