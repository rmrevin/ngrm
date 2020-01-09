import { Actions, ErrorAction, FinishAction, StartAction, SuccessAction } from './remote-actions';
import { ActionReducerFn, RemoteStateData, RemoteStateStage } from './shared';

export default new Map<string, ActionReducerFn<RemoteStateData<any>>>([
  [Actions.START, requestStartReducer],
  [Actions.ERROR, requestFailedReducer],
  [Actions.SUCCESS, requestSuccessReducer],
  [Actions.FINISH, requestFinishReducer],
]);

export function requestStartReducer (state: RemoteStateData<any>, action: StartAction): Partial<RemoteStateData<any>> {
  return {
    inProgress: true,
    error: undefined,
  };
}

export function requestFailedReducer (state: RemoteStateData<any>, action: ErrorAction): Partial<RemoteStateData<any>> {
  return {
    stage: RemoteStateStage.Failed,
    error: action.error,
    meta: action.meta,
  };
}

export function requestSuccessReducer (state: RemoteStateData<any>, action: SuccessAction): Partial<RemoteStateData<any>> {
  return {
    stage: RemoteStateStage.Success,
    data: action.data,
    meta: action.meta,
  };
}

export function requestFinishReducer (state: RemoteStateData<any>, action: FinishAction) {
  return {
    inProgress: false,
  };
}
