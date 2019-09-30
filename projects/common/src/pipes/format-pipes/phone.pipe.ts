import { Pipe, PipeTransform } from '@angular/core';
import { formatNumber, NumberFormat } from 'libphonenumber-js';
import { clearPhone } from '../../functions/clear-phone';

@Pipe({name: 'phone'})
export class PhonePipe implements PipeTransform
{
  public transform (value: string | undefined, format: NumberFormat = 'National'): string {
    return value ? formatNumber(`+${clearPhone(value)}`, format) : '';
  }
}
