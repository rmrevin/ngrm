import { Directive, OnDestroy } from '@angular/core';
import { untilDestroyed } from '@ngrm/common';
import { Observable, Subject, timer } from 'rxjs';
import { switchMap, take, takeUntil } from 'rxjs/operators';

@Directive()
export class RemoteSource<REQUEST, RESPONSE> implements OnDestroy
{
  private readonly _abort = new Subject<void>();
  public readonly abort = this._abort.asObservable();

  public constructor (private requestTransport: (params?: REQUEST) => Observable<RESPONSE>) {
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
    return timer(delayTime).pipe(
      take(1),
      switchMap(requestFactory),
      takeUntil(this.abort),
      untilDestroyed(this),
    );
  }

  public complete (): void {
    this.ngOnDestroy();
  }

  public ngOnDestroy (): void {
    this._abort.next();
    this._abort.complete();
  }
}
