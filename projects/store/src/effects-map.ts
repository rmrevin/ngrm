export type EffectsMapValue<K, V> = Array<[K, V]>;

export class EffectsMap<K, V>
{
  private value: EffectsMapValue<K, V> = [];

  public constructor (initialValue?: EffectsMapValue<K, V>) {
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

  public forEach (callbackfn: (value: [K, V], index: number, map: EffectsMapValue<K, V>) => void, thisArg?: any) {
    return this.value.forEach(callbackfn, thisArg);
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
