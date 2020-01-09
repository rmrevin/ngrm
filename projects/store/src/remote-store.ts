import { OnDestroy } from '@angular/core';
import { untilDestroyed } from '@ngrm/common';
import { Observable, Subject, timer } from 'rxjs';
import { catchError, finalize, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { ErrorAction, FinishAction, StartAction, SuccessAction } from './remote-actions';
import reducers from './remote-reducers';
import { RemoteStateData, RemoteStateStage } from './shared';
import { NgrmStore } from './store';

export class RemoteStore<REQUEST, RESPONSE> extends NgrmStore<RemoteStateData<RESPONSE>> implements OnDestroy
{
  private readonly _abort = new Subject<void>();
  public readonly abort = this._abort.asObservable();

  public constructor (private requestTransport: (params?: REQUEST) => Observable<RESPONSE>) {
    super({
      inProgress: false,
      stage: RemoteStateStage.New,
      data: undefined,
      error: undefined,
      meta: undefined,
    }, reducers);
  }

  /**
   * Method for single-threaded data acquisition (all previous requests will be automatically canceled)
   */
  public fetch (params?: REQUEST, delayTime: number = 0): Observable<RESPONSE> {

    this._abort.next();

    return this.send(params, delayTime);
  }

  /**
   * Method for sending a request easily (you need to cancel repeated requests manually)
   */
  public send (params?: REQUEST, delayTime: number = 0): Observable<RESPONSE> {
    return this.executeRequest((): any => {
      return this.requestTransport(params);
    }, delayTime);
  }

  /**
   * Method for debugging failed api state
   */
  public makeFail (delayTime: number = 0, message: string = 'Fake fail emitted'): Observable<RESPONSE> {
    return this.executeRequest(() => {
      throw new Error(message);
    }, delayTime);
  }

  private executeRequest (requestFactory: () => Observable<RESPONSE>, delayTime: number = 0): Observable<RESPONSE> {
    this.dispatch(new StartAction());

    return timer(delayTime, 0).pipe(
      take(1),
      switchMap(requestFactory),
      catchError(error => {
        this.dispatch(new ErrorAction(error));

        throw error;
      }),
      tap((data: RESPONSE) => this.dispatch(new SuccessAction(data))),
      finalize(() => this.dispatch(new FinishAction())),
      takeUntil(this.abort),
      untilDestroyed(this),
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
    this._abort.next();
    this._abort.complete();

    super.ngOnDestroy();
  }
}
