import * as _momentTz from 'moment-timezone';

const moment = _momentTz;

export function dateToUtc (date: _momentTz.Moment | Date | string, format?: _momentTz.MomentFormatSpecification): _momentTz.Moment | null {
  if (!date) {
    return null;
  }

  return moment(date, format).utcOffset(0, true);
}

export function dateFromUtc (date: _momentTz.Moment | Date | string, format?: _momentTz.MomentFormatSpecification): _momentTz.Moment | null {
  if (!date) {
    return null;
  }

  return moment(date, format).utc(true);
}
