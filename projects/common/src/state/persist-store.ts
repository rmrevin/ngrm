import { OnDestroy } from '@angular/core';
import { Observable, SubscriptionLike } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { untilDestroyed } from '../operators';
import { Store } from './store';

export interface CacheItemInterface
{
  get<T> (): Observable<T>;

  set<T> (value: T): Observable<T>;
}

export class PersistStore<STATE> extends Store<STATE> implements OnDestroy
{
  private autosave: SubscriptionLike;

  public constructor (protected defaultValue: STATE,
                      private cacheItem: CacheItemInterface,
                      autosave: boolean = true,
  ) {
    super(defaultValue);

    this.loadState();

    if (autosave) {
      this.enableAutosave();
    }
  }

  public loadState (): void {
    this.cacheItem.get<STATE>().pipe(
      take(1),
      untilDestroyed(this),
      filter(data => !!data),
    ).subscribe(data => this.update(data));
  }

  public saveState (state: STATE): Observable<STATE> {
    return this.cacheItem.set(state);
  }

  public enableAutosave (): void {
    if (this.autosave) {
      return;
    }

    this.autosave = this.select<STATE>(state => state).pipe(
      untilDestroyed(this),
    ).subscribe(state => this.saveState(state));
  }

  public disableAutosave (): void {
    if (!this.autosave) {
      return;
    }

    this.autosave.unsubscribe();
  }

  public ngOnDestroy (): void {
    super.ngOnDestroy();
  }
}
