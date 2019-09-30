import * as _moment from 'moment-timezone';

const moment = _moment;

export function dateToUtc (date: _moment.Moment | Date | string): _moment.Moment | null {
  if (!date) {
    return null;
  }

  return moment(date).utcOffset(0, true);
}

export function dateFromUtc (date: _moment.Moment | Date | string): _moment.Moment | null {
  if (!date) {
    return null;
  }

  return moment(date).utc(true);
}
