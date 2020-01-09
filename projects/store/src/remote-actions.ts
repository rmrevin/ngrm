import { Action } from './shared';

export enum Actions
{
  START = '[http] start',
  ERROR = '[http] error',
  SUCCESS = '[http] success',
  FINISH = '[http] finish'
}

export class StartAction implements Action
{
  type = Actions.START;
}

export class ErrorAction implements Action
{
  type = Actions.ERROR;

  public constructor (public error: any, public meta?: any) {
  }
}

export class SuccessAction implements Action
{
  type = Actions.SUCCESS;

  public constructor (public data: any, public meta?: any) {
  }
}

export class FinishAction implements Action
{
  type = Actions.FINISH;
}
