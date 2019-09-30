import { HttpErrorResponse } from '@angular/common/http';
import { OnDestroy } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, Subject, timer } from 'rxjs';
import { catchError, delay, finalize, map, take, takeUntil, tap } from 'rxjs/operators';

export interface ApiRequestState<DATA>
{
  loaded: boolean;
  inProgress: boolean;
  data: Readonly<DATA> | undefined;
  error: any | undefined;
}

export class ApiRequestSubject<REQUEST, RESPONSE> implements OnDestroy
{
  private readonly _state = new BehaviorSubject<ApiRequestState<RESPONSE>>({
    loaded: false,
    inProgress: false,
    data: undefined,
    error: undefined,
  });

  private readonly destroyed = new Subject<void>();
  private readonly abort = new Subject<void>();

  public constructor (private requestTransport: (params?: REQUEST) => Observable<Readonly<RESPONSE>>) {}

  public fetch (params?: REQUEST, delayTime: number = 0): Observable<Readonly<RESPONSE>> {
    this.abort.next();

    this.nextState({
      inProgress: true,
      error: undefined,
    });

    return this.requestTransport(params).pipe(
      delay(delayTime),
      finalize(() => this.nextState({inProgress: false})),
      takeUntil(this.destroyed),
      takeUntil(this.abort),
      catchError((response: HttpErrorResponse) => {
        this.nextState({error: response.error});

        return EMPTY;
      }),
      tap(data =>
        this.nextState({
          loaded: true,
          data,
        }),
      ),
    );
  }

  public makeFail (delay: number = 1000): Observable<Readonly<RESPONSE>> {
    this.nextState({
      inProgress: true,
      error: undefined,
    });

    return timer(delay).pipe(
      take(1),
      finalize(() => this.nextState({inProgress: false})),
      map(() => {
        throw new Error('Fake fail emitted');
      }),
      catchError((error: Error) => {
        this.nextState({error});

        return EMPTY;
      }),
      tap(() =>
        this.nextState({
          loaded: true,
        }),
      ),
    );
  }

  private nextState (value: Partial<ApiRequestState<RESPONSE>>): void {
    this._state.next({
      ...this._state.value,
      ...value,
    });
  }

  // геттеры - костыль для проброса интерфейса
  // почему-то теряется интерфейс data в шаблонах

  public get snapshot (): ApiRequestState<RESPONSE> {
    return this._state.value;
  }

  public get state (): Observable<ApiRequestState<RESPONSE>> {
    return this._state;
  }

  public get loaded (): Observable<boolean> {
    return this._state.pipe(map(state => state.loaded));
  }

  public get inProgress (): Observable<boolean> {
    return this._state.pipe(map(state => state.inProgress));
  }

  public get data (): Observable<Readonly<RESPONSE> | undefined> {
    return this._state.pipe(map(state => state.data));
  }

  public get error (): Observable<any | undefined> {
    return this._state.pipe(map(state => state.error));
  }

  // alias for ngOnDestroy
  public complete (): void {
    // tslint:disable-next-line:no-lifecycle-call
    this.ngOnDestroy();
  }

  public ngOnDestroy (): void {
    this._state.complete();

    this.abort.next();
    this.abort.complete();

    this.destroyed.next();
    this.destroyed.complete();
  }
}
