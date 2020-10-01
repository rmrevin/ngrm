import * as _momentTz from 'moment-timezone';
import { Moment, MomentFormatSpecification, MomentInput } from 'moment-timezone';

const moment = _momentTz;

export function dateToUtc (date: MomentInput, format?: MomentFormatSpecification): Moment | null {
  if (!date) {
    return null;
  }

  return moment(date, format).utcOffset(0, true);
}

export function dateFromUtc (date: MomentInput, format?: MomentFormatSpecification): Moment | null {
  if (!date) {
    return null;
  }

  return moment(date, format).utc(true);
}
