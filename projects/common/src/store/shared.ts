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
