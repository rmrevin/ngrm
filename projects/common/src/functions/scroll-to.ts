export function scrollToTop (behavior: ScrollBehavior = 'auto'): void {
  scrollTo({top: 0, left: 0, behavior});
}

export function scrollTo (options?: ScrollToOptions): void {
  if (document && document.scrollingElement) {
    document.scrollingElement.scrollTo(options);
  }
}
