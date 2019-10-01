import { Observable } from 'rxjs';
import { unique } from '../functions';

/**
 * Пайп извлекает одно поле из массива объектов
 * Применение:
 *
 * .pipe(extract('fieldName'))
 * или
 * .pipe(extract((item) => item.fieldName)))
 */

export type ExtractPipe<T extends object, K extends keyof T> = (source: Observable<Array<T>>) => Observable<Array<T[K]>>;

export type ExtractGetterFn<T extends object, K extends keyof T> = (item: T) => T[K];

export function extract<T extends object, K extends keyof T> (key: K | ExtractGetterFn<T, K>): ExtractPipe<T, K> {
  return (source: Observable<Array<T>>) => {
    return new Observable<Array<T[K]>>(observer => source.subscribe({
      next (value: Array<T>): void {
        observer.next(extractFn(value, key));
      },
      error (err): void {
        observer.error(err);
      },
      complete (): void {
        observer.complete();
      },
    }));
  };
}

function extractFn<T extends object, K extends keyof T> (input: Array<T>, key: K | ExtractGetterFn<T, K>): Array<T[K]> {
  return input
    .filter(item => !!get(item, key))
    .map(item => get(item, key))
    .filter(unique);
}

function get<T extends object, K extends keyof T> (item: T, key: K | ExtractGetterFn<T, K>): T[K] {
  if (typeof key === 'function') {
    return key(item);
  }

  if (typeof key === 'string') {
    return item[key];
  }

  throw new Error('extractPipe: Unsupported getter.');
}
