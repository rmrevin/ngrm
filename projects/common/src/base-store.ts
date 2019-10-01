import { OnDestroy } from '@angular/core';
import { cloneDeep, isEqual } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, take } from 'rxjs/operators';
import { untilDestroyed } from './operators';

export interface AbstractStorageInterface
{
  getItem<T> (key: string): Observable<T>;

  setItem<T> (key: string, value: T): Observable<void>;
}

export abstract class BaseStore<STATE> implements OnDestroy
{
  private readonly state = new BehaviorSubject<Readonly<STATE>>(null);

  protected constructor (protected defaultState: Readonly<STATE>) {
    this.state.next(defaultState);
  }

  public ngOnDestroy (): void {
    this.state.complete();
  }

  public get snapshot (): Readonly<STATE> {
    return this.state.value;
  }

  public update (patchState: Readonly<Partial<STATE>>): void {
    this.state.next({
      ...this.snapshot,
      ...patchState,
    });
  }

  public select<R> (project: (state: Readonly<STATE>) => R, compareFn?: (a: any, b: any) => boolean): Observable<R> {
    return this.state.pipe(
      distinctUntilChanged(compareFn ? compareFn : (a, b) => isEqual(project(a), project(b))),
      map(project),
    );
  }

  public patch (stateMutation: (state: Readonly<STATE>) => void): void {
    const state = cloneDeep(this.state.value);

    stateMutation(state);

    this.update(state);
  }

  protected syncState<STATE, K extends keyof STATE> (key: string, storage: AbstractStorageInterface, project: (state: any) => STATE) {
    storage.getItem<Readonly<STATE>>(key).pipe(
      take(1),
      filter(data => !!data),
    ).subscribe(data => this.update(data));

    this.select(project).pipe(
      untilDestroyed(this),
      switchMap(state => storage.setItem(key, state)),
    ).subscribe();
  }
}
