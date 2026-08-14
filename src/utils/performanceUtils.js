import { isMobileDevice } from './deviceDetection.js';

/**
 * Coarse CSS-level performance tier — drives how much backdrop blur and how
 * many decorative animations the page is willing to paint.
 * Separate from the Three.js tier in deviceDetection.js on purpose: a machine
 * can be fine with a WebGL scene but still choke on twelve blurred panels.
 */
export function detectPerformanceLevel() {
  if (typeof navigator === 'undefined') return 'high';

  let score = 0;

  const cores = navigator.hardwareConcurrency || 4;
  if (cores >= 8) score += 3;
  else if (cores >= 4) score += 2;
  else score += 1;

  const memory = navigator.deviceMemory || 4;
  if (memory >= 8) score += 3;
  else if (memory >= 4) score += 2;
  else score += 1;

  const effectiveType = navigator.connection?.effectiveType;
  if (effectiveType === '4g' || !effectiveType) score += 2;
  else if (effectiveType === '3g') score += 1;

  if (isMobileDevice()) score -= 2;

  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

/** Applied once on app mount; CSS branches on [data-performance]. */
export function applyPerformanceClass() {
  const level = detectPerformanceLevel();
  document.documentElement.setAttribute('data-performance', level);

  const supportsBlur =
    typeof CSS !== 'undefined' &&
    (CSS.supports?.('backdrop-filter', 'blur(4px)') ||
      CSS.supports?.('-webkit-backdrop-filter', 'blur(4px)'));

  if (!supportsBlur) {
    document.documentElement.setAttribute('data-no-backdrop-filter', 'true');
  }

  return level;
}

/** Trailing-edge throttle for resize/scroll listeners. */
export function throttle(fn, wait = 200) {
  let last = 0;
  let timer = null;
  return (...args) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      clearTimeout(timer);
      timer = null;
      last = now;
      fn(...args);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  };
}
