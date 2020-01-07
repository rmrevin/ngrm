import { ActionInterface } from '@ngrm/store';

export enum Actions
{
  ReloadAction = '[ui-component] Reload',
  ReloadFailedAction = '[ui-component] Reload failed',
  NewMessageAction = '[ui-component] Set new message',
}

export class ReloadAction implements ActionInterface
{
  readonly type = Actions.ReloadAction;
}

export class ReloadFailedAction implements ActionInterface
{
  readonly type = Actions.ReloadFailedAction;
}

export class NewMessageAction implements ActionInterface
{
  readonly type = Actions.NewMessageAction;

  public constructor (public message: string) {}
}
