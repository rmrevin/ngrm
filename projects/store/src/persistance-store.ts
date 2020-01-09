import { OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { skip, take, takeUntil, tap } from 'rxjs/operators';
import { CacheItem } from './shared';
import { NgrmStore } from './store';

export class PersistanceStore<STATE> extends NgrmStore<STATE> implements OnDestroy
{
  private _autosaveEnabled: boolean;

  private readonly _loaded = new Subject<STATE>();
  private readonly _destroyed = new Subject<void>();
  private readonly _stopAutosave = new Subject<void>();

  public constructor (protected defaultValue: STATE,
                      private cacheItem: CacheItem<STATE>,
                      private autoload: boolean = true,
                      private autosave: boolean = true,
  ) {
    super(defaultValue);

    if (autoload) {
      this.loadState().subscribe(() => {
        if (autosave) {
          this.enableAutosave();
        }
      });
    } else if (autosave) {
      this.enableAutosave();
    }
  }

  public loadState (): Observable<STATE> {
    return this.cacheItem.get().pipe(
      take(1),
      takeUntil(this._destroyed),
      tap(data => {
        if (!!data) {
          this.next(data);
          this._loaded.next(data);
        }
      }),
    );
  }

  public saveState (state: STATE): Observable<STATE> {
    return this.cacheItem.set(state);
  }

  public get loaded (): Observable<STATE> {
    return this._loaded.asObservable();
  }

  public get autosaveEnabled (): boolean {
    return this._autosaveEnabled;
  }

  public enableAutosave (): void {
    if (this.autosaveEnabled) {
      return;
    }

    this.select().pipe(
      takeUntil(this._destroyed),
      takeUntil(this._stopAutosave),
      tap(() => this._autosaveEnabled = true),
      skip(1),
    ).subscribe(state => this.saveState(state));
  }

  public disableAutosave (): void {
    if (!this.autosaveEnabled) {
      return;
    }

    this._stopAutosave.next();

    this._autosaveEnabled = false;
  }

  public ngOnDestroy (): void {
    this._destroyed.next();
    this._destroyed.complete();

    this._stopAutosave.next();
    this._stopAutosave.complete();

    this._loaded.complete();

    super.ngOnDestroy();
  }
}
