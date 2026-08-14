/**
 * Device capability detection used to size the 3D scene.
 * Everything here is read once on mount — never per frame.
 */

export const isMobileDevice = () =>
  typeof navigator !== 'undefined' &&
  (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    (window.matchMedia?.('(pointer: coarse)').matches && window.innerWidth < 768));

export const isTabletDevice = () => {
  if (typeof window === 'undefined') return false;
  const ua = /iPad|Tablet|PlayBook|Silk/i.test(navigator.userAgent);
  const byWidth = window.innerWidth >= 768 && window.innerWidth <= 1024;
  return ua || byWidth;
};

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Never render above 2x — 3x/4x phone screens tank the frame rate for free. */
export const getPixelRatio = (max = 2) =>
  typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio || 1, max);

export const isWebGLSupported = () => {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    if (!gl) return false;
    // Release immediately so we don't hold a context we aren't rendering to.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
};

const estimatedMemoryGB = () => {
  if (typeof navigator === 'undefined') return 4;
  if (navigator.deviceMemory) return navigator.deviceMemory;
  if (isMobileDevice()) return 2;
  if (isTabletDevice()) return 3;
  return 4;
};

/**
 * The config object every 3D component reads.
 * Tiers: desktop → tablet → mobile, then a low-memory haircut on top.
 */
export function getPerformanceConfig() {
  const reduced = prefersReducedMotion();

  const config = {
    particleCount: 1800,
    enableCaustics: true,
    enableCreatures: true,
    antialias: true,
    powerPreference: 'high-performance',
    textureResolution: 1024,
    enableAnimations: !reduced,
  };

  if (isTabletDevice()) {
    config.particleCount = 1100;
    config.antialias = true;
    config.powerPreference = 'default';
    config.textureResolution = 768;
  }

  if (isMobileDevice()) {
    config.particleCount = 550;
    config.enableCaustics = false;
    config.antialias = false;
    config.powerPreference = 'low-power';
    config.textureResolution = 512;
  }

  if (estimatedMemoryGB() < 2) {
    config.particleCount = Math.round(config.particleCount * 0.5);
    config.enableCaustics = false;
    config.textureResolution = 256;
  }

  if (reduced) {
    config.enableAnimations = false;
    config.enableCaustics = false;
  }

  return config;
}
