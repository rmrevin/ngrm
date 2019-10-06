import { OnDestroy } from '@angular/core';
import { cloneDeep, isEqual } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

export class Store<STATE> extends BehaviorSubject<Readonly<STATE>> implements OnDestroy
{
  public constructor (protected defaultValue: STATE) {
    super(defaultValue);
  }

  public select<R> (project: (state: Readonly<STATE>) => Readonly<R>,
                    compareFn?: (a: STATE, b: STATE) => boolean,
  ): Observable<Readonly<R>> {
    return this.asObservable().pipe(
      distinctUntilChanged(compareFn ? compareFn : (a, b) => isEqual(project(a), project(b))),
      map(project),
    );
  }

  public update (patchState: Partial<STATE>): void {
    this.next({
      ...this.value,
      ...patchState,
    });
  }

  public patch (stateMutation: (state: Readonly<STATE>) => void): void {
    const state = cloneDeep(this.value);

    stateMutation(state);

    this.update(state);
  }

  public ngOnDestroy (): void {
    this.complete();
  }
}
