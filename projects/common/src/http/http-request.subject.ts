import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, delay, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

export enum HttpRequestStage
{
  New = 'new',
  Pending = 'pending',
  Failed = 'failed',
  Success = 'success',
}

export interface HttpRequestState<DATA>
{
  stage: HttpRequestStage;
  status: number | undefined;
  data: Readonly<DATA> | undefined;
  error: any | undefined;
}

export class HttpRequestSubject<REQUEST, RESPONSE> implements OnDestroy
{
  private readonly _state = new BehaviorSubject<HttpRequestState<RESPONSE>>({
    stage: HttpRequestStage.New,
    status: undefined,
    data: undefined,
    error: undefined,
  });

  private readonly destroyed = new Subject<void>();
  private readonly abort = new Subject<void>();

  public constructor (private requestTransport: (params?: REQUEST) => Observable<HttpResponse<Readonly<RESPONSE>>>) {}

  /**
   * Метод для однопоточного получения данных (все предыдущие запросы будут автоматически отменены)
   */
  public fetch (params?: REQUEST, delayTime: number = 0): Observable<Readonly<RESPONSE>> {

    this.abort.next();

    return this.send(params, delayTime);
  }

  /**
   * Метод для простой отправки запроса (отменять повторые запросы нужно вручную)
   */
  public send (params?: REQUEST, delayTime: number = 0): Observable<Readonly<RESPONSE>> {
    return this.executeRequest((): any => {
      return this.requestTransport(params);
    }, delayTime);
  }

  /**
   * Метод для отладки состояния зафейлившегося api
   */
  public makeFail (delayTime: number = 1000): Observable<Readonly<RESPONSE>> {
    return this.executeRequest(() => {
      throw new Error('Fake fail emitted');
    }, delayTime);
  }

  private executeRequest (requestFactory: () => Observable<HttpResponse<Readonly<RESPONSE>>>, delayTime: number = 1000): Observable<Readonly<RESPONSE>> {
    return of(true).pipe(
      take(1),
      tap(() => this.nextState({
        stage: HttpRequestStage.Pending,
        error: undefined,
      })),
      delay(delayTime),
      switchMap(requestFactory),
      catchError((response: HttpErrorResponse) => {
        this.nextState({
          stage: HttpRequestStage.Failed,
          status: response.status,
          error: response.error,
        });

        throw response;
      }),
      tap((response: HttpResponse<Readonly<RESPONSE>>) => this.nextState({
        stage: HttpRequestStage.Success,
        status: response.status,
        data: response.body,
      })),
      map((response: HttpResponse<Readonly<RESPONSE>>) => response.body),
      takeUntil(this.destroyed),
      takeUntil(this.abort),
    );
  }

  private nextState (value: Partial<HttpRequestState<RESPONSE>>): void {
    this._state.next({
      ...this._state.value,
      ...value,
    });
  }

  // геттеры - костыль для проброса интерфейса
  // почему-то теряется интерфейс data в шаблонах

  public get snapshot (): HttpRequestState<RESPONSE> {
    return this._state.value;
  }

  public get state (): Observable<HttpRequestState<RESPONSE>> {
    return this._state;
  }

  public get stage (): Observable<HttpRequestStage> {
    return this._state.pipe(map(state => state.stage));
  }

  public get status (): Observable<number> {
    return this._state.pipe(map(state => state.status));
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
