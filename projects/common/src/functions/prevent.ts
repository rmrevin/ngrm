export function prevent (e: Event, stop: boolean = true) {
  e.preventDefault();

  if (stop) {
    e.stopPropagation();
  }
}
