import { ActionReducerFn, ReducersMap } from '@ngrm/store';
import { Actions, NewMessageAction, ReloadAction, ReloadFailedAction } from './actions';
import { UiStoreStateData } from './store';

export default new ReducersMap<string, ActionReducerFn<UiStoreStateData>>([
  [Actions.NewMessageAction, newMessageReducer],
  [Actions.ReloadAction, reloadStartedReducer],
  [Actions.ReloadFailedAction, reloadFailedReducer],
]);

export function reloadStartedReducer (state: UiStoreStateData, action: ReloadAction): Partial<UiStoreStateData> {
  return {
    inProgress: true,
    error: null,
  };
}

export function reloadFailedReducer (state: UiStoreStateData, action: ReloadFailedAction): Partial<UiStoreStateData> {
  return {
    inProgress: false,
    error: true,
  };
}

export function newMessageReducer (state: UiStoreStateData, action: NewMessageAction): Partial<UiStoreStateData> {
  return {
    inProgress: false,
    message: action.message,
  };
}
