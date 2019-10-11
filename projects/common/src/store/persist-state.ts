import { OnDestroy } from '@angular/core';
import { Observable, Subject, SubscriptionLike } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';
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

  private readonly destroyed = new Subject<void>();

  public constructor (protected defaultValue: STATE,
                      private cacheItem: CacheItemInterface<STATE>,
                      autoload: boolean = false,
                      autosave: boolean = true,
  ) {
    super(defaultValue);

    if (autoload) {
      this.loadState().subscribe();
    }

    if (autosave) {
      this.enableAutosave();
    }
  }

  public loadState (): Observable<STATE> {
    return this.cacheItem.get().pipe(
      take(1),
      takeUntil(this.destroyed),
      tap(data => {
        if (!!data) {
          this.update(data);
        }
      }),
    );
  }

  public saveState (state: STATE): Observable<STATE> {
    return this.cacheItem.set(state);
  }

  public enableAutosave (): void {
    if (this.autosave) {
      return;
    }

    this.autosave = this.select<STATE>(state => state).pipe(
      takeUntil(this.destroyed),
    ).subscribe(state => this.saveState(state));
  }

  public disableAutosave (): void {
    if (!this.autosave) {
      return;
    }

    this.autosave.unsubscribe();
  }

  public ngOnDestroy (): void {
    this.destroyed.next();
    this.destroyed.complete();

    super.ngOnDestroy();
  }
}
