import { Action } from '@ngrm/store';

export enum Actions
{
  ReloadAction = '[ui-component] Reload',
  ReloadFailedAction = '[ui-component] Reload failed',
  NewMessageAction = '[ui-component] Set new message',
}

export class ReloadAction implements Action
{
  readonly type = Actions.ReloadAction;
}

export class ReloadFailedAction implements Action
{
  readonly type = Actions.ReloadFailedAction;
}

export class NewMessageAction implements Action
{
  readonly type = Actions.NewMessageAction;

  public constructor (public message: string) {}
}
