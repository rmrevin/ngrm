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

  public forEach (callbackfn: (value: [K, V], index: number, array: EffectsMapValue<K, V>) => void) {
    return this.value.forEach(callbackfn);
  }

  public push (key: K, value: V): void {
    this.value.push([key, value]);
  }

  public pop (): [K, V] | undefined {
    return this.value.pop();
  }

  public clear (): void {
    if (this.value.length > 0) {
      this.value.splice(0, this.value.length);
    }
  }
}
