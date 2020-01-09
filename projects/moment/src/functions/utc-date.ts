import * as _momentTz from 'moment-timezone';

const moment = _momentTz;

export function dateToUtc (date: _momentTz.Moment | Date | string): _momentTz.Moment | null {
  if (!date) {
    return null;
  }

  return moment(date).utcOffset(0, true);
}

export function dateFromUtc (date: _momentTz.Moment | Date | string): _momentTz.Moment | null {
  if (!date) {
    return null;
  }

  return moment(date).utc(true);
}
