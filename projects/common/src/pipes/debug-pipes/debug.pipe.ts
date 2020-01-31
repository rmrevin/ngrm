import { Inject, Pipe, PipeTransform } from '@angular/core';
import { debugFn } from '../../functions';
import { DEBUG } from '../../shared';

@Pipe({ name: 'debug' })
export class DebugPipe implements PipeTransform
{
  public constructor (@Inject(DEBUG) private debug: boolean = false) {}

  public transform (value: any, namespace: string = '@ngrm:DebugPipe'): string {
    if (this.debug) {
      debugFn(namespace)(value);
    }

    return '';
  }
}
