import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'number'})
export class NumberPipe implements PipeTransform
{
  transform (value: number, fractionDigits: number = 0, locale: string = 'ru-RU'): string {
    if (typeof value === 'undefined' || value === null) {
      return '';
    }

    const options: Intl.NumberFormatOptions = {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: fractionDigits,
    };

    return value.toLocaleString(locale, options);
  }
}
