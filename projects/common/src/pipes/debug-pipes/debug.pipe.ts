import { Inject, Pipe, PipeTransform } from '@angular/core';
import { debug } from '../../functions';
import { DEBUG } from '../../shared';

@Pipe({ name: 'debug' })
export class DebugPipe implements PipeTransform
{
  public constructor (@Inject(DEBUG) private debug: boolean = false) {}

  public transform (value: any, namespace: string = 'app:debug'): string {
    if (this.debug) {
      debug(namespace)(value);
    }

    return '';
  }
}
