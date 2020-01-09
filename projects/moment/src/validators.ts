import { AbstractControl } from '@angular/forms';
import * as _moment from 'moment';

const moment = _moment;

// @dynamic
export class MomentValidators
{
  static date (control: AbstractControl): { date: true } | null {
    const { value } = control;

    if (value && !moment.isMoment(value) && !moment.isDate(value) && !moment(value).isValid()) {
      return { date: true };
    }

    return null;
  }
}
