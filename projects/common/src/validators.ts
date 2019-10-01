import { AbstractControl } from '@angular/forms';
import * as _moment from 'moment';
import {
  clearPhone,
  validateCardNumber,
  validateInn,
  validateKpp,
  validateOgrn,
  validateOgrnIp,
  validateRandomUuid,
  validateRuPhone,
  validateUuid,
} from './functions';

const moment = _moment;

// @dynamic
export class CommonValidators
{
  static atLeastChecked (min = 1): (control: AbstractControl) => { atLeastChecked: true } | null {
    return function (control: AbstractControl) {
      const checked = Object.values(control.value).filter(value => value === true).length;

      if (checked < min) {
        return {atLeastChecked: true};
      }

      return null;
    };
  }

  static mustBe (expectedValue: any): (control: AbstractControl) => { mustBe: true } | null {
    return (control: AbstractControl) => {
      const {value} = control;

      if (value !== expectedValue) {
        return {mustBe: true};
      }

      return null;
    };
  }

  static number (
    minlength: number,
    maxlength: number | null = null,
  ): (control: AbstractControl) => { number: true } | null {
    return (control: AbstractControl) => {
      const {value} = control;

      let length = '';

      if (maxlength === null) {
        length = `{${minlength}}`;
      } else {
        length = `{${minlength},${maxlength}}`;
      }

      const pattern = new RegExp(`^[0-9]${length}$`);

      if (value && !pattern.test(value)) {
        return {number: true};
      }

      return null;
    };
  }

  static ogrn (control: AbstractControl): { ogrn: true } | null {
    const {value} = control;

    const error = {};

    if (value && !validateOgrn(value, error) && !validateOgrnIp(value, error)) {
      return {ogrn: true};
    }

    return null;
  }

  static inn (control: AbstractControl): { inn: true } | null {
    const {value} = control;

    const error = {};

    if (value && !validateInn(value, error)) {
      return {inn: true};
    }

    return null;
  }

  static kpp (control: AbstractControl): { kpp: true } | null {
    const {value} = control;

    const error = {};

    if (value && !validateKpp(value, error)) {
      return {kpp: true};
    }

    return null;
  }

  static phone (control: AbstractControl): { phone: true } | null {
    const {value} = control;

    if (value && clearPhone(value) !== '7' && !validateRuPhone(value)) {
      return {phone: true};
    }

    return null;
  }

  static passport (control: AbstractControl): { passport: true } | null {
    const {value} = control;

    if (value && !/^[0-9]{4}\s[0-9]{6}$/.test(value)) {
      return {passport: true};
    }

    return null;
  }

  static fnType (control: AbstractControl): { fnType: true } | null {
    const {value} = control;

    if (value && !/^(15|36)$/.test(value)) {
      return {fnType: true};
    }

    return null;
  }

  static in (values: Array<string | number | boolean>): (control: AbstractControl) => { in: true } | null {
    return (control: AbstractControl) => {
      const {value} = control;

      if (value && values.indexOf(value) === -1) {
        return {in: true};
      }

      return null;
    };
  }

  static compare (getter: () => string): (control: AbstractControl) => { notEquals: true } | null {
    return (control: AbstractControl) => {
      const {value} = control;

      if (getter() !== value) {
        return {notEquals: true};
      }

      return null;
    };
  }

  static date (control: AbstractControl): { date: true } | null {
    const {value} = control;

    if (value && !moment.isMoment(value) && !moment.isDate(value) && !moment(value).isValid()) {
      return {date: true};
    }

    return null;
  }

  static edoId (control: AbstractControl): { edoId: true } | null {
    const {value} = control;

    if (value && !/^2[a-z]{2}[a-z0-9-+_]{1,43}$/i.test(value)) {
      return {edoId: true};
    }

    return null;
  }

  static card (control: AbstractControl): { card: true } | null {
    const {value} = control;

    if (value && !validateCardNumber(value)) {
      return {card: true};
    }

    return null;
  }

  // эта валидация проверяет, что строка является валидным uuid
  static uuid (control: AbstractControl): { uuid: true } | null {
    const {value} = control;

    if (value && !validateUuid(value)) {
      return {uuid: true};
    }

    return null;
  }

  // эта валидация проверяет, что строка "похожа" на uuid
  static randomUuid (control: AbstractControl): { uuid: true } | null {
    const {value} = control;

    if (value && !validateRandomUuid(value)) {
      return {uuid: true};
    }

    return null;
  }
}
