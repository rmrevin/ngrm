import { Inject, Pipe, PipeTransform } from '@angular/core';
import { ruPpuntoSwitcher } from '../../functions';
import { DEBUG } from '../../shared';

@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform
{
  public constructor (@Inject(DEBUG) private debug: boolean = false) {}

  public transform (value: string | undefined, query: string): string {
    if (!value) {
      return '';
    }

    if (!query) {
      return value;
    }

    const puntoQuery = ruPpuntoSwitcher(query);

    try {
      const pattern = new RegExp(`(${query}|${puntoQuery})`, 'iu');

      return value.replace(pattern, '<mark>$1</mark>');
    } catch (e) {
      if (this.debug && console) {
        console.warn(e);
      }

      return value;
    }
  }
}
