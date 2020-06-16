import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { moneyFormat } from '../../functions';
import { CURRENCY } from '../../shared';

@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform
{
  public constructor (@Inject(LOCALE_ID) private locale: string,
                      @Inject(CURRENCY) private currency: string,
  ) {}

  public transform (value: number | string,
                    withFraction: boolean = false,
                    currency?: string,
                    locale?: string,
  ): string {
    return moneyFormat(value, withFraction, currency || this.currency, locale || this.locale);
  }
}
