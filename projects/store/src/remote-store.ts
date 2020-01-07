import { OnDestroy } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError, delay, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { RemoteStateData, RemoteStateStage } from './shared';
import { NgrmStore } from './store';

export class RemoteStore<REQUEST, RESPONSE> extends NgrmStore<RemoteStateData<RESPONSE>> implements OnDestroy
{
  protected readonly destroyed = new Subject<void>();
  protected readonly abort = new Subject<void>();

  public constructor (private requestTransport: (params?: REQUEST) => Observable<RESPONSE>) {
    super({
      inProgress: false,
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

  private executeRequest (requestFactory: () => Observable<RESPONSE>, delayTime: number = 0): Observable<RESPONSE> {
    return of(true).pipe(
      take(1),
      tap(() => this.update({
        inProgress: true,
        error: undefined,
      })),
      delay(delayTime),
      switchMap(requestFactory),
      catchError(error => {
        this.update({
          stage: RemoteStateStage.Failed,
          inProgress: false,
          error,
        });

        throw error;
      }),
      tap((data: RESPONSE) => this.update({
        stage: RemoteStateStage.Success,
        inProgress: false,
        data,
      })),
      takeUntil(this.destroyed),
      takeUntil(this.abort),
    );
  }

  /**
   * Get the current stage of request execution
   */
  public get stage (): Observable<RemoteStateStage> {
    return this.select<RemoteStateStage>(state => state.stage);
  }

  /**
   * Check that the request is in progress.
   */
  public get inProgress (): Observable<boolean> {
    return this.select<boolean>(state => state.inProgress);
  }

  /**
   * Check that the request has not yet been sent.
   */
  public get isUntouched (): Observable<boolean> {
    return this.stage.pipe(map(stage => stage === RemoteStateStage.New));
  }

  /**
   * Check that the request has yet been sent.
   */
  public get isTouched (): Observable<boolean> {
    return this.stage.pipe(map(stage => stage !== RemoteStateStage.New));
  }

  /**
   * Check that the request has been completed (no matter what the result is)
   */
  public get isCompleted (): Observable<boolean> {
    return this.stage.pipe(map(stage => stage === RemoteStateStage.Success || stage === RemoteStateStage.Failed));
  }

  /**
   * Check that the request was successful.
   */
  public get isSuccessful (): Observable<boolean> {
    return this.stage.pipe(map(stage => stage === RemoteStateStage.Success));
  }

  /**
   * Check that the request failed
   */
  public get isFailed (): Observable<boolean> {
    return this.stage.pipe(map(stage => stage === RemoteStateStage.Failed));
  }

  /**
   * Get response body
   */
  public get data (): Observable<RESPONSE | undefined> {
    return this.select(state => state.data);
  }

  /**
   * Get response error
   * This getter name is in conflict with the error method in rxjs/Subject
   */
  public get err (): Observable<any | undefined> {
    return this.select(state => state.error);
  }

  public get meta (): Observable<any | undefined> {
    return this.select(state => state.meta);
  }

  public ngOnDestroy (): void {
    this.abort.next();
    this.abort.complete();

    this.destroyed.next();
    this.destroyed.complete();

    super.ngOnDestroy();
  }
}
