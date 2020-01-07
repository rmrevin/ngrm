import { OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { skip, take, takeUntil, tap } from 'rxjs/operators';
import { State } from './state';

export interface CacheItemInterface<T>
{
  get (): Observable<T>;

  set (value: T): Observable<T>;

  remove (): Observable<void>;
}

/**
 * @deprecated use PersistanceStore from package @ngrm/store
 */
export class PersistState<STATE> extends State<STATE> implements OnDestroy
{
  private ɵautosaveEnabled: boolean;

  private readonly ɵloaded = new Subject<STATE>();
  private readonly ɵdestroyed = new Subject<void>();
  private readonly ɵstopAutosave = new Subject<void>();

  public constructor (protected defaultValue: STATE,
                      private cacheItem: CacheItemInterface<STATE>,
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
      takeUntil(this.ɵdestroyed),
      tap(data => {
        if (!!data) {
          this.next(data);
          this.ɵloaded.next(data);
        }
      }),
    );
  }

  public saveState (state: STATE): Observable<STATE> {
    return this.cacheItem.set(state);
  }

  public get loaded (): Observable<STATE> {
    return this.ɵloaded.asObservable();
  }

  public get autosaveEnabled (): boolean {
    return this.ɵautosaveEnabled;
  }

  public enableAutosave (): void {
    if (this.autosaveEnabled) {
      return;
    }

    this.select().pipe(
      takeUntil(this.ɵdestroyed),
      takeUntil(this.ɵstopAutosave),
      tap(() => this.ɵautosaveEnabled = true),
      skip(1),
    ).subscribe(state => this.saveState(state));
  }

  public disableAutosave (): void {
    if (!this.autosaveEnabled) {
      return;
    }

    this.ɵstopAutosave.next();

    this.ɵautosaveEnabled = false;
  }

  public ngOnDestroy (): void {
    this.ɵdestroyed.next();
    this.ɵdestroyed.complete();

    this.ɵstopAutosave.next();
    this.ɵstopAutosave.complete();

    this.ɵloaded.complete();

    super.ngOnDestroy();
  }
}
