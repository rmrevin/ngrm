import { EventEmitter, OnDestroy } from '@angular/core';
import { isFunction, isObject, untilDestroyed } from '@ngrm/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, skipWhile, switchMap, take, tap } from 'rxjs/operators';
import {
  ActionEffectFn,
  ActionEffectsMap,
  ActionInterface,
  ActionReducerFn,
  ActionReducersMap,
  StateCompareFn,
  StateProjectFn,
  StateReducerFn,
} from './shared';
import { wrapIntoObservable } from './utils';

const cloneDeep = require('lodash/cloneDeep');
const isEqual = require('lodash/isEqual');

export class NgrmStore<STATE> extends BehaviorSubject<STATE> implements OnDestroy
{
  public constructor (protected readonly defaultValue: STATE,
                      reducers?: ActionReducersMap<STATE>,
                      effects?: ActionEffectsMap<STATE>,
  ) {
    super(defaultValue);

    if (reducers && reducers.size > 0) {
      this.registerReducers(reducers);

      reducers.clear();
    }

    if (effects && effects.size > 0) {
      this.registerEffects(effects);

      effects.clear();
    }
  }

  /**
   * Mutations
   */

  public reset (): void {
    super.next(this.defaultValue);
  }

  public transaction (fn: (state: STATE) => STATE | Promise<STATE> | Observable<STATE>): Observable<STATE> {
    return wrapIntoObservable(fn(this.snapshot)).pipe(
      take(1),
      tap(nextState => this.update(nextState)),
      map(() => this.snapshot),
    );
  }

  public update (nextState: Partial<STATE> | StateReducerFn<STATE>): void {
    const state = this.snapshot;

    if (isFunction(nextState)) {
      super.next(nextState(state));
    } else if (isObject(state)) {
      super.next({
        ...this.snapshot,
        ...nextState,
      });
    } else {
      super.next(nextState as STATE);
    }
  }

  /**
   * Selectors
   */

  public get snapshot (): STATE {
    return cloneDeep(this.value);
  }

  public select (): Observable<STATE>;
  public select<R> (project: StateProjectFn<STATE, R>, compareFn?: StateCompareFn<STATE>): Observable<R>;
  public select<R> (project?: StateProjectFn<STATE, R>, compareFn?: StateCompareFn<STATE>): Observable<R | STATE> {
    if (!compareFn) {
      compareFn = (a, b) => project ? isEqual(project(a), project(b)) : isEqual(a, b);
    }

    return this.asObservable().pipe(
      distinctUntilChanged(compareFn),
      map(state => project ? project(state) : state),
    );
  }

  public waitFor (): Observable<STATE>;
  public waitFor<R> (project: StateProjectFn<STATE, R>, compareFn?: StateCompareFn<STATE>): Observable<R>;
  public waitFor<R> (project?: StateProjectFn<STATE, R>, compareFn?: StateCompareFn<STATE>): Observable<R | STATE> {
    return this.select(project, compareFn).pipe(
      skipWhile(data => {
        if (Array.isArray(data)) {
          return data.length === 0;
        }

        return !data;
      }),
    );
  }

  /**
   * Actions dispatcher
   */

  private readonly _dispatcher$ = new EventEmitter<ActionInterface>();

  public dispatch (action: ActionInterface): void {
    this._dispatcher$.emit(action);
  }

  /**
   * Action reducers
   */

  public registerReducers (reducersMap: ActionReducersMap<STATE>): void {
    reducersMap.forEach((handler, type) => this.registerReducer(type, handler));
  }

  public registerReducer (actionType: string, handler: ActionReducerFn<STATE>): void {
    this._dispatcher$.pipe(
      untilDestroyed(this),
      filter(action => action.type === actionType),
    ).subscribe(action => this.update(handler(this.snapshot, action)));
  }

  /**
   * Action effects
   */

  public registerEffects (effectsMap: ActionEffectsMap<STATE>): void {
    effectsMap.forEach((handler, type) => this.registerEffect(type, handler));
  }

  public registerEffect (actionType: string, handler: ActionEffectFn<STATE>): void {
    this._dispatcher$.pipe(
      untilDestroyed(this),
      filter(action => action.type === actionType),
      switchMap(action => handler(this.snapshot, action)),
    ).subscribe(nextAction => this._dispatcher$.emit(nextAction));
  }

  /**
   * Lifecycle
   */

  public complete (): void {
    this.ngOnDestroy();
  }

  public ngOnDestroy (): void {
    super.complete();
  }
}
