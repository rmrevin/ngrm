export type ReducersMapValue<K, V> = Array<[K, V]>;

export class ReducersMap<K, V>
{
  private value: ReducersMapValue<K, V> = [];

  public constructor (initialValue?: ReducersMapValue<K, V>) {
    if (initialValue && Array.isArray(initialValue)) {
      this.value = initialValue;
    }
  }

  public get size (): number {
    return this.value.length;
  }

  public get length (): number {
    return this.value.length;
  }

  public forEach (callbackfn: (value: [K, V], index: number, array: ReducersMapValue<K, V>) => void) {
    return this.value.forEach(callbackfn);
  }

  public push (key: K, value: V): void {
    this.value.push([key, value]);
  }

  public pop (): [K, V] | undefined {
    return this.value.pop();
  }

  public clear (): void {
    this.value = [];
  }

  public delete (action: K): void {
    this.value = this.value.filter(([key]) => key !== action);
  }
}
