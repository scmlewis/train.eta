export function setHeaderHeightVar(): void {
  if (typeof window === 'undefined') return;
  const headerEl = document.querySelector('.app-header') as HTMLElement | null;
  const height = headerEl ? Math.round(headerEl.getBoundingClientRect().height) : 56;
  document.documentElement.style.setProperty('--app-header-height', `${height}px`);
}

export function scrollToTop(behavior: ScrollBehavior = 'auto') {
  if (typeof window === 'undefined') return;
  const doScroll = () => {
    try { window.scrollTo({ top: 0, left: 0, behavior }); } catch { window.scrollTo(0, 0); }
  };
  doScroll();
  requestAnimationFrame(() => { doScroll(); requestAnimationFrame(doScroll); });
}

export function scrollToElement(el: HTMLElement | null, options?: { behavior?: ScrollBehavior; maxAttempts?: number; attemptDelay?: number; }) {
  if (typeof window === 'undefined') return Promise.resolve();
  if (!el) return Promise.resolve();
  const behavior = options?.behavior ?? 'smooth';
  const maxAttempts = options?.maxAttempts ?? 6;
  const attemptDelay = options?.attemptDelay ?? 80;

    const tryScroll = (): boolean => {
    if (!el) return true;
    const rect = el.getBoundingClientRect();
    // If element has zero size, DOM may not be ready yet
    if (rect.width === 0 && rect.height === 0) return false;
    // Prefer scrollIntoView so CSS `scroll-margin-top` is honored for sticky headers
    try {
      el.scrollIntoView({ behavior, block: 'start' });
    } catch (e) {
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--app-header-height')) || 0;
      const top = rect.top + window.scrollY - headerH - 8;
      try {
        window.scrollTo({ top, behavior });
      } catch {
        window.scrollTo(0, top);
      }
    }
    return true;
  };

  return new Promise<void>((resolve) => {
    let attempts = 0;
    const run = () => {
      const ok = tryScroll();
      if (ok || attempts >= maxAttempts) return resolve();
      attempts += 1;
      setTimeout(run, attemptDelay);
    };
    // ensure header var is up-to-date before trying
    setHeaderHeightVar();
    requestAnimationFrame(run);
  });
}
