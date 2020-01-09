import { Observable, of, timer } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { ActionEffectFn, Action, ActionReducerFn } from './shared';
import { NgrmStore } from './store';
import { isAction } from './utils';

interface TestStoreStateData
{
  error: boolean;
  inProgress: boolean;
  items: Array<string>;
}

describe('NgrmStore actions', () => {
  let store: NgrmStore<TestStoreStateData>;

  beforeEach(() => {
    store = new NgrmStore<TestStoreStateData>({
      error: false,
      inProgress: false,
      items: [],
    }, getReducers(), getEffects());
  });

  afterEach(() => {
    if (store) {
      store.complete();
      store = null;
    }
  });

  it('should create', () => {
    expect(store).toBeTruthy();
  });

  it('can execute', (done) => {
    store.dispatch(new RequestData());

    expect(store.snapshot.inProgress).toBeTruthy();

    store.waitFor(state => state.items).pipe(
      take(1),
    ).subscribe(items => {
      expect(items.length).toBe(3);
      done();
    });
  });

  it('can use isAction', () => {
    store.dispatch(new RequestData());

    expect(isAction(new RequestData())).toBeTruthy();
  });
});

enum Actions
{
  RequestData = '[test] request data',
  RequestDataFailed = '[test] request data loading failed',
  NewListData = '[test] new list data',
}

class RequestData implements Action
{
  readonly type = Actions.RequestData;
}

class RequestDataFailed implements Action
{
  readonly type = Actions.RequestDataFailed;
}

class NewListData implements Action
{
  readonly type = Actions.NewListData;

  constructor (public readonly items: Array<string>) {}
}

function getReducers () {
  return new Map<string, ActionReducerFn<TestStoreStateData>>([
    [Actions.NewListData, newListDataReducer],
    [Actions.RequestData, requestDataStartedReducer],
    [Actions.RequestDataFailed, requestDataFailedReducer],
  ]);
}

function requestDataStartedReducer (state: TestStoreStateData, action: RequestData): Partial<TestStoreStateData> {
  return {
    inProgress: true,
    error: null,
  };
}

function requestDataFailedReducer (state: TestStoreStateData, action: RequestDataFailed): Partial<TestStoreStateData> {
  return {
    inProgress: false,
    error: true,
  };
}

function newListDataReducer (state: TestStoreStateData, action: NewListData): Partial<TestStoreStateData> {
  return {
    inProgress: false,
    items: action.items,
  };
}

function getEffects () {
  return new Map<string, ActionEffectFn<TestStoreStateData>>([
    [Actions.RequestData, newListDataEffect],
  ]);
}

function newListDataEffect (state: TestStoreStateData, action: RequestData): Observable<Action> {
  return requestRemoteData().pipe(
    map(result => new NewListData(result)),
    catchError(() => of(new RequestDataFailed())),
  );
}

function requestRemoteData (delay: number = 300): Observable<Array<string>> {
  return timer(delay).pipe(
    take(1),
    map(() => [
      '1', '2', '3',
    ]),
  );
}

