import { OnDestroy } from '@angular/core';
import { cloneDeep, isEqual } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, skipWhile } from 'rxjs/operators';

export type ProjectFn<STATE, RESULT> = (state: STATE) => RESULT;
export type CompareFn<STATE> = (a: STATE, b: STATE) => boolean;
export type ReducerFn<STATE> = (state: STATE) => STATE;

export class State<STATE> extends BehaviorSubject<STATE> implements OnDestroy
{
  public constructor (protected readonly defaultValue: STATE) {
    super(defaultValue);
  }

  public get snapshot (): STATE {
    return cloneDeep(this.value);
  }

  public select (): Observable<STATE>;
  public select<R> (project: ProjectFn<STATE, R>, compareFn?: CompareFn<STATE>): Observable<R>;
  public select<R> (project?: ProjectFn<STATE, R>, compareFn?: CompareFn<STATE>): Observable<R | STATE> {
    if (!compareFn) {
      compareFn = (a, b) => project ? isEqual(project(a), project(b)) : isEqual(a, b);
    }

    return this.asObservable().pipe(
      distinctUntilChanged(compareFn),
      map(state => project ? project(state) : state),
    );
  }

  public waitFor (): Observable<STATE>;
  public waitFor<R> (project: ProjectFn<STATE, R>, compareFn?: CompareFn<STATE>): Observable<R>;
  public waitFor<R> (project?: ProjectFn<STATE, R>, compareFn?: CompareFn<STATE>): Observable<R | STATE> {
    return this.select(project, compareFn).pipe(
      skipWhile(data => {
        if (Array.isArray(data)) {
          return data.length === 0;
        }

        return !data;
      }),
    );
  }

  public reset (): void {
    this.next(this.defaultValue);
  }

  public update (nextState: Partial<STATE> | ReducerFn<STATE>): void {
    const state = this.snapshot;

    if (typeof nextState === 'function') {
      this.next(nextState(state));
    } else if (typeof state === 'object' && state !== null) {
      this.next({
        ...this.snapshot,
        ...nextState,
      });
    } else {
      this.next(<STATE>nextState);
    }
  }

  public transaction<R> (fn: (state: STATE) => R): R {
    const state = this.snapshot;

    const result = fn(state);

    this.next(state);

    return result;
  }

  public complete (): void {
    this.ngOnDestroy();
  }

  public ngOnDestroy (): void {
    super.complete();
  }
}
