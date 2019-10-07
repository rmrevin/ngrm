export enum RemoteStateStage
{
  New = 'new',
  Pending = 'pending',
  Failed = 'failed',
  Success = 'success',
}

export interface RemoteStateData<DATA>
{
  stage: RemoteStateStage;
  data: Readonly<DATA> | undefined;
  error: any | undefined;
  meta: any;
}

export interface HttpHeadersCollection
{
  [key: string]: Array<string>;
}
