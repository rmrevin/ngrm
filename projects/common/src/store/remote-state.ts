import { OnDestroy } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError, delay, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { RemoteStateData, RemoteStateStage } from './shared';
import { State } from './state';

export class RemoteState<REQUEST, RESPONSE> extends State<RemoteStateData<RESPONSE>> implements OnDestroy
{
  protected readonly destroyed = new Subject<void>();
  protected readonly abort = new Subject<void>();

  public constructor (private requestTransport: (params?: REQUEST) => Observable<Readonly<RESPONSE>>) {
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
  public makeFail (delayTime: number = 0, message: string = 'Fake fail emitted'): Observable<Readonly<RESPONSE>> {
    return this.executeRequest(() => {
      throw new Error(message);
    }, delayTime);
  }

  private executeRequest (requestFactory: () => Observable<Readonly<RESPONSE>>, delayTime: number = 0): Observable<Readonly<RESPONSE>> {
    return of(true).pipe(
      take(1),
      tap(() => this.update({
        stage: RemoteStateStage.Pending,
        error: undefined,
      })),
      delay(delayTime),
      switchMap(requestFactory),
      catchError(error => {
        this.update({
          stage: RemoteStateStage.Failed,
          error,
        });

        throw error;
      }),
      tap((data: Readonly<RESPONSE>) => this.update({
        stage: RemoteStateStage.Success,
        data,
      })),
      takeUntil(this.destroyed),
      takeUntil(this.abort),
    );
  }

  public get state (): Observable<RemoteStateData<RESPONSE>> {
    return this.select(state => state);
  }

  public get stage (): Observable<RemoteStateStage> {
    return this.select(state => state.stage);
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

  public get data (): Observable<Readonly<RESPONSE> | undefined> {
    return this.select(state => state.data);
  }

  public get error (): Observable<any | undefined> {
    return this.select(state => state.error);
  }

  public get meta (): Observable<any | undefined> {
    return this.select(state => state.meta);
  }

  // alias for ngOnDestroy
  public complete (): void {
    // tslint:disable-next-line:no-lifecycle-call
    this.ngOnDestroy();
  }

  public ngOnDestroy (): void {
    this.abort.next();
    this.abort.complete();

    this.destroyed.next();
    this.destroyed.complete();

    super.ngOnDestroy();
  }
}
