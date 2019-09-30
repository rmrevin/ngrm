import { Inject, Pipe, PipeTransform } from '@angular/core';
import { DEBUG } from '../../shared';

@Pipe({name: 'log'})
export class LogPipe implements PipeTransform
{
  public constructor (@Inject(DEBUG) private debug: boolean = false) {}

  public transform (value: any): string {
    if (this.debug) {
      console.log(value);
    }

    return '';
  }
}
