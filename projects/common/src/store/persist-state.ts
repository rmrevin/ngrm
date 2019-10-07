import { OnDestroy } from '@angular/core';
import { Observable, SubscriptionLike } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { untilDestroyed } from '../operators';
import { State } from './state';

export interface CacheItemInterface<T>
{
  get (): Observable<T>;

  set (value: T): Observable<T>;

  remove (): Observable<void>;
}

export class PersistState<STATE> extends State<STATE> implements OnDestroy
{
  private autosave: SubscriptionLike;

  public constructor (protected defaultValue: STATE,
                      private cacheItem: CacheItemInterface<STATE>,
                      autosave: boolean = true,
  ) {
    super(defaultValue);

    this.loadState();

    if (autosave) {
      this.enableAutosave();
    }
  }

  public loadState (): void {
    this.cacheItem.get().pipe(
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
