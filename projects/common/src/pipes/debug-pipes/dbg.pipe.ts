import { Inject, Pipe, PipeTransform } from '@angular/core';
import { dbg } from '../../functions';
import { DEBUG } from '../../shared';

@Pipe({name: 'dbg'})
export class DbgPipe implements PipeTransform
{
  public constructor (@Inject(DEBUG) private debug: boolean = false) {}

  public transform (value: any, namespace: string = 'app:dbg-pipe'): string {
    if (this.debug) {
      dbg(namespace)(value);
    }

    return '';
  }
}
