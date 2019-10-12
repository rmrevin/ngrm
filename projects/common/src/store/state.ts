import { OnDestroy } from '@angular/core';
import { cloneDeep, isEqual } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

export type ProjectFn<STATE, RESULT> = (state: Readonly<STATE>) => RESULT;
export type CompareFn<STATE> = (a: STATE, b: STATE) => boolean;

export class State<STATE> extends BehaviorSubject<Readonly<STATE>> implements OnDestroy
{
  public constructor (protected defaultValue: STATE) {
    super(defaultValue);
  }

  public get snapshot (): Readonly<STATE> {
    return cloneDeep(this.value);
  }

  public select (): Observable<STATE>;
  public select<R> (project: ProjectFn<STATE, R>, compareFn?: CompareFn<STATE>): Observable<R>;
  public select<R> (project?: ProjectFn<STATE, R>, compareFn?: CompareFn<STATE>): Observable<R | STATE> {
    if (!compareFn) {
      compareFn = (a, b) => project ? isEqual(project(a), project(b)) : isEqual(a, b);
    }

    const stream = this.asObservable().pipe(
      distinctUntilChanged(compareFn),
    );

    if (!project) {
      return stream;
    }

    return stream.pipe(map(project));
  }

  public reset (): void {
    this.next(this.defaultValue);
  }

  public update (stateMutation: Partial<STATE> | ((state: STATE) => STATE)): void {
    const state = this.snapshot;

    if (typeof stateMutation === 'function') {
      this.next(stateMutation(state));
    } else if (typeof state === 'object' && state !== null) {
      this.next({
        ...this.snapshot,
        ...stateMutation,
      });
    } else {
      this.next(stateMutation as STATE);
    }
  }

  public complete (): void {
    this.ngOnDestroy();
  }

  public ngOnDestroy (): void {
    super.complete();
  }
}
