import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'number' })
export class NumberPipe implements PipeTransform
{
  public constructor (@Inject(LOCALE_ID) private locale: string) {}

  public transform (value: number,
                    fractionDigits: number = 0,
                    style: 'decimal' | 'percent' | 'currency' = 'decimal',
                    locale?: string,
  ): string {
    if (typeof value === 'undefined' || value === null) {
      return '';
    }

    const options: Intl.NumberFormatOptions = {
      style,
      minimumFractionDigits: 0,
      maximumFractionDigits: fractionDigits,
    };

    return value.toLocaleString(locale || this.locale, options);
  }
}
