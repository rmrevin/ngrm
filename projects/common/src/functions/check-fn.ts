import * as _moment from 'moment';
import { Moment } from 'moment';

const moment = _moment;

const isEqual = require('lodash/isEqual');
const pick = require('lodash/pick');

export function isUndefined (target: any): target is undefined {
  return target === undefined;
}

export function isNull (target: any): target is null {
  return target === null;
}

export function isArray (target: any): target is Array<any> {
  return Array.isArray(target);
}

export function isString (target: any): target is string {
  return typeof target === 'string';
}

export function isBoolean (target: any): target is boolean {
  return typeof target === 'boolean';
}

export function isNumber (target: any): target is number {
  return typeof target === 'number';
}

export function isObjectLike (target: any): target is object {
  return typeof target === 'object' && target !== null;
}

export function isObject (target: any): target is object {
  return isObjectLike(target) && !isArray(target);
}

export function isPlainObject (target: any): target is object {
  if (!isObject(target)) {
    return false;
  }

  const targetPrototype = Object.getPrototypeOf(target);

  return targetPrototype === Object.prototype || targetPrototype === null;
}

export function isFunction (target: any): target is Function {
  return typeof target === 'function';
}

export function isDate (target: any): target is Date {
  return Object.prototype.toString.call(target) === '[object Date]';
}

export function isMoment (target: any): target is Moment {
  return moment.isMoment(target);
}

export function hasOwnProperty (target: object, propertyName: string): boolean {
  return Object.prototype.hasOwnProperty.call(target, propertyName);
}

export function isEqualStruct<T> (keys?: Array<keyof T | string>): (a, b) => boolean {
  return (a, b) => isEqual(
    keys ? pick(a, keys) : a,
    keys ? pick(b, keys) : b,
  );
}
