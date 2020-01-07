export function hashCode (input: string): number {
  if (input.length === 0) {
    return 0;
  }

  let hash = 0;

  for (let i = 0; i < input.length; i++) {
    const chr = input.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }

  return hash;
}
