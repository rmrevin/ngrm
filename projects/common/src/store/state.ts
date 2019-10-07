import { OnDestroy } from '@angular/core';
import { isEqual } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

export class State<STATE> implements OnDestroy
{
  private _state: BehaviorSubject<Readonly<STATE>>;

  public constructor (protected defaultValue: STATE) {
    this._state = new BehaviorSubject<Readonly<STATE>>(defaultValue);
  }

  public get snapshot (): Readonly<STATE> {
    return this._state.value;
  }

  public select<R> (project: (state: Readonly<STATE>) => R,
                    compareFn?: (a: STATE, b: STATE) => boolean,
  ): Observable<Readonly<R>> {
    return this._state.asObservable().pipe(
      distinctUntilChanged(compareFn ? compareFn : (a, b) => isEqual(project(a), project(b))),
      map(project),
    );
  }

  public update (patchState: Partial<STATE>): void {
    this._state.next({
      ...this.snapshot,
      ...patchState,
    });
  }

  public patch (stateMutation: (state: Readonly<STATE>) => void): void {
    const state = this.snapshot;

    stateMutation(state);

    this.update(state);
  }

  public ngOnDestroy (): void {
    this._state.complete();
  }
}
