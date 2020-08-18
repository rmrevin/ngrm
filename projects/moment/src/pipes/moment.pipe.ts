import { Pipe, PipeTransform } from '@angular/core';
import * as _moment from 'moment';

const moment = _moment;

@Pipe({ name: 'moment' })
export class MomentPipe implements PipeTransform
{
  transform (value: _moment.MomentInput, format?: string): string {
    return value ? moment(value).format(format) : '';
  }
}
