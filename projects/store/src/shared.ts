import { Observable } from 'rxjs';

export interface Action
{
  readonly type: string;
}

export type StateProjectFn<STATE, RESULT> = (state: STATE) => RESULT;
export type StateCompareFn<STATE> = (a: STATE, b: STATE) => boolean;
export type StateReducerFn<STATE> = (state: STATE) => STATE;

export type ActionReducerFn<STATE> = (state: STATE, action: Action) => Partial<STATE>;
export type ActionReducersMap<STATE> = Map<string, ActionReducerFn<STATE>>;

export type ActionEffectFn<STATE> = (state: STATE, action: Action) => Observable<Action>;
export type ActionEffectsMap<STATE> = Map<string, ActionEffectFn<STATE>>;

export enum RemoteStateStage
{
  New = 'new',
  Failed = 'failed',
  Success = 'success',
}

export interface RemoteStateData<DATA>
{
  inProgress: boolean;
  stage: RemoteStateStage;
  data: Readonly<DATA> | undefined;
  error: any | undefined;
  meta: any;
}

export interface HttpHeadersCollection
{
  [key: string]: Array<string>;
}


