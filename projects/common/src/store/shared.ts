/**
 * @deprecated use RemoteStateStage from package @ngrm/store
 */
export enum RemoteStateStage
{
  New = 'new',
  Failed = 'failed',
  Success = 'success',
}

/**
 * @deprecated use RemoteStateData from package @ngrm/store
 */
export interface RemoteStateData<DATA>
{
  inProgress: boolean;
  stage: RemoteStateStage;
  data: Readonly<DATA> | undefined;
  error: any | undefined;
  meta: any;
}

/**
 * @deprecated use HttpHeadersCollection from package @ngrm/store
 */
export interface HttpHeadersCollection
{
  [key: string]: Array<string>;
}
