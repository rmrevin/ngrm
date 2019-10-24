import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { OnDestroy } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError, delay, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { HttpHeadersCollection, RemoteStateData, RemoteStateStage } from './shared';
import { State } from './state';

export class HttpState<REQUEST, RESPONSE> extends State<RemoteStateData<RESPONSE>> implements OnDestroy
{
  private readonly destroyed = new Subject<void>();
  private readonly abort = new Subject<void>();

  public constructor (private requestTransport: (params?: REQUEST) => Observable<HttpResponse<RESPONSE>>) {
    super({
      stage: RemoteStateStage.New,
      data: undefined,
      error: undefined,
      meta: undefined,
    });
  }

  /**
   * Метод для однопоточного получения данных (все предыдущие запросы будут автоматически отменены)
   */
  public fetch (params?: REQUEST, delayTime: number = 0): Observable<RESPONSE> {

    this.abort.next();

    return this.send(params, delayTime);
  }

  /**
   * Метод для простой отправки запроса (отменять повторые запросы нужно вручную)
   */
  public send (params?: REQUEST, delayTime: number = 0): Observable<RESPONSE> {
    return this.executeRequest((): any => {
      return this.requestTransport(params);
    }, delayTime);
  }

  /**
   * Метод для отладки состояния зафейлившегося api
   */
  public makeFail (delayTime: number = 0, message: string = 'Fake fail emitted'): Observable<RESPONSE> {
    return this.executeRequest(() => {
      throw new Error(message);
    }, delayTime);
  }

  private executeRequest (requestFactory: () => Observable<HttpResponse<RESPONSE>>, delayTime: number = 0): Observable<RESPONSE> {
    return of(true).pipe(
      take(1),
      tap(() => this.update({
        stage: RemoteStateStage.Pending,
        error: undefined,
      })),
      delay(delayTime),
      switchMap(requestFactory),
      catchError((response: HttpErrorResponse) => {
        this.update({
          stage: RemoteStateStage.Failed,
          error: response.error,
          meta: {
            url: response.url,
            status: response.status,
            headers: exportHeaders(response.headers),
          },
        });

        throw response;
      }),
      tap((response: HttpResponse<RESPONSE>) => this.update({
        stage: RemoteStateStage.Success,
        data: response.body,
        meta: {
          url: response.url,
          status: response.status,
          headers: exportHeaders(response.headers),
        },
      })),
      map((response: HttpResponse<RESPONSE>) => response.body),
      takeUntil(this.destroyed),
      takeUntil(this.abort),
    );
  }

  public get stage (): Observable<RemoteStateStage> {
    return this.select<RemoteStateStage>(state => state.stage);
  }

  public get inProgress (): Observable<boolean> {
    return this.stage.pipe(map(stage => stage === RemoteStateStage.Pending));
  }

  public get isLoaded (): Observable<boolean> {
    return this.stage.pipe(map(stage => stage === RemoteStateStage.Success));
  }

  public get isError (): Observable<boolean> {
    return this.stage.pipe(map(stage => stage === RemoteStateStage.Failed));
  }

  public get data (): Observable<RESPONSE | undefined> {
    return this.select(state => state.data);
  }

  /**
   * Такое название геттера связано с конфликтом с методом error в rxjs/Subject
   */
  public get err (): Observable<any | undefined> {
    return this.select(state => state.error);
  }

  public get meta (): Observable<any | undefined> {
    return this.select(state => state.meta);
  }

  public get httpStatus (): Observable<number | undefined> {
    return this.meta.pipe(map(meta => meta.status));
  }

  public get httpHeaders (): Observable<HttpHeadersCollection | undefined> {
    return this.meta.pipe(map(meta => meta.headers));
  }

  public ngOnDestroy (): void {
    this.abort.next();
    this.abort.complete();

    this.destroyed.next();
    this.destroyed.complete();

    super.ngOnDestroy();
  }
}

function exportHeaders (headers: HttpHeaders): HttpHeadersCollection {
  return headers.keys().reduce((result, key: string) => {
    if (!result[key]) {
      result[key] = [];
    }

    result[key] = headers.getAll(key);

    return result;
  }, {});
}
