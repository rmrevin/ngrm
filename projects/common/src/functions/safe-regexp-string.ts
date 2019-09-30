export function safeRegexpString (input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
