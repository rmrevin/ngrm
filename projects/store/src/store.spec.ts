import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { count, filter, finalize, map, take, takeUntil } from 'rxjs/operators';
import { NgrmStore } from './store';

describe('NgrmStore', () => {
  let store: NgrmStore<any>;

  afterEach(() => {
    if (store) {
      store.complete();
      store = null;
    }
  });

  it('should create', () => {
    store = new NgrmStore<boolean>(false);

    expect(store).toBeTruthy();

    store.next(true);

    expect(store.value).toBeTruthy();
  });

  it('should complete', () => {
    store = new NgrmStore<boolean>(false);

    expect(store).toBeTruthy();

    const counter = new BehaviorSubject<number>(0);

    store.subscribe(value => counter.next(counter.value + 1));
    store.subscribe(value => counter.next(counter.value + 1));

    store.next(false);

    store.complete();

    store.subscribe(value => counter.next(counter.value + 1));

    store.next(true);

    expect(counter.value).toBe(4);

    counter.complete();
  });

  it('can mutations', () => {
    store = new NgrmStore<boolean>(false);

    store.next(true);

    expect(store.value).toBeTruthy();

    store.next(false);

    expect(store.value).toBeFalsy();
  });

  it('can observe', (done) => {
    store = new NgrmStore<boolean>(false);

    store.select().pipe(
      filter(value => !!value),
    ).subscribe(value => {
      expect(value).toBeTruthy();
      done();
    });

    timer(0, 300).pipe(
      take(1),
    ).subscribe(() => store.next(true));
  });

  it('can observe raw', (done) => {
    store = new NgrmStore<boolean>(false);

    const until$ = new Subject<void>();

    store.pipe(
      takeUntil(until$),
      count(),
      finalize(() => done()),
    ).subscribe(emitCount => expect(emitCount).toBe(5));

    timerUntil(until$)
      .subscribe(() => store.next(true));
  });

  it('can observe memoized', (done) => {
    store = new NgrmStore<boolean>(false);

    const until$ = new Subject<void>();

    store.select().pipe(
      takeUntil(until$),
      count(),
      finalize(() => done()),
    ).subscribe(emitCount => expect(emitCount).toBe(2));

    timerUntil(until$)
      .subscribe(() => store.next(true));
  });

  it('can wait data', (done) => {
    store = new NgrmStore<{ value: boolean }>({ value: false });

    store.waitFor(state => state.value).pipe(
      take(1),
    ).subscribe(value => {
      expect(value).toBeTruthy();
      done();
    });

    timer(300, 0).pipe(
      take(1),
    ).subscribe(() => store.next({ value: true }));
  });

  it('can wait array data', (done) => {
    store = new NgrmStore<{ items: Array<any> }>({ items: [] });

    store.waitFor(state => state.items).pipe(
      take(1),
    ).subscribe(value => {
      expect(value).toBeTruthy();
      done();
    });

    timer(300, 0).pipe(
      take(1),
    ).subscribe(() => store.next({ items: ['1', '2'] }));
  });

  it('can reset data', () => {
    const defaultValue = {
      value: false,
      items: [],
    };

    const mutateValue = {
      value: true,
      items: [1, 2, 3],
    };

    store = new NgrmStore<{ value: boolean, items: Array<any> }>(defaultValue);

    expect(store.snapshot).toEqual(defaultValue);

    store.next(mutateValue);

    expect(store.snapshot).toEqual(mutateValue);

    store.reset();

    expect(store.snapshot).toEqual(defaultValue);
  });

  it('can transaction observable', (done) => {

    store = new NgrmStore<boolean>(false);

    store.transaction((state): Observable<boolean> => {
      return timer(200, 0).pipe(
        take(1),
        map(() => true),
      );
    }).subscribe(value => {
      expect(value).toBeTruthy();
      done();
    });
  });

  it('can transaction promise', (done) => {

    store = new NgrmStore<boolean>(false);

    store.transaction((state): Promise<boolean> => {
      return new Promise<boolean>(resolve => resolve(true));
    }).subscribe(value => {
      expect(value).toBeTruthy();
      done();
    });
  });

  it('can transaction raw', (done) => {

    store = new NgrmStore<boolean>(false);

    store.transaction((state): boolean => true).subscribe(value => {
      expect(value).toBeTruthy();
      done();
    });
  });

  it('can update', () => {

    store = new NgrmStore<{
      valueA: boolean,
      valueB: boolean,
    }>({
      valueA: false,
      valueB: false,
    });

    store.update({
      valueA: true,
    });

    expect(store.snapshot.valueA).toBeTruthy();
    expect(store.snapshot.valueB).toBeFalsy();

    store.update(state => ({
      valueA: false,
      valueB: true,
    }));

    expect(store.snapshot.valueA).toBeFalsy();
    expect(store.snapshot.valueB).toBeTruthy();
  });
});

function timerUntil (until$: Subject<void>, takeNum: number = 4, period: number = 100) {
  return timer(0, period).pipe(
    take(takeNum),
    finalize(() => {
      until$.next();
      until$.complete();
    }),
  );
}
