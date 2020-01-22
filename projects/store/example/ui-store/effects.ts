import { Action, ActionEffectFn, EffectsMap } from '@ngrm/store';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { Actions, NewMessageAction, ReloadAction, ReloadFailedAction } from './actions';
import { UiStoreStateData } from './store';

export default new EffectsMap<string, ActionEffectFn<UiStoreStateData>>([
  [Actions.ReloadAction, reloadEffect],
]);

export function reloadEffect (state: UiStoreStateData, action: ReloadAction): Observable<Action> {
  return requestRemoteData().pipe(
    map(result => new NewMessageAction(result)),
    catchError(() => of(new ReloadFailedAction())),
  );
}

function requestRemoteData (delay: number = 300): Observable<string> {
  return timer(0, delay).pipe(
    take(1),
    map(() => (new Date()).toString()),
  );
}
