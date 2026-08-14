export const NAV_OFFSET = 84;

export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
}

export function scrollToTop() {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
}

/** 0 → 1 progress through the whole document, used by the camera drift. */
export function getScrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / max));
}
