export const COLOR_PALETTE = {
  deepWater: '#0a2540',
  midWater: '#0a4f5c',
  shallowWater: '#1a5f7a',
  sunRays: '#4db8ff',
  caustics: '#88ccff',
  ambient: '#1a5f7a',
  particles: '#ffffff',
  bubbles: '#e0f7ff',
  sand: '#c2b280',
  seabed: '#0a4f5c',
};

export const FOG_CONFIG = {
  color: COLOR_PALETTE.deepWater,
  near: 9,
  far: 46,
};

export const CAMERA_CONFIG = {
  fov: 72,
  near: 0.1,
  far: 1000,
  position: [0, 0, 10],
  mouse: {
    maxRotationDeg: 5,
    lerpFactor: 0.045,
  },
  scroll: {
    // Scrolling the page pulls the camera deeper into the scene.
    minZ: 8,
    maxZ: 13,
    minY: 0,
    maxY: -3.2,
    lerpFactor: 0.05,
  },
};

export const PARTICLE_CONFIG = {
  size: { min: 0.05, max: 0.16 },
  opacity: { min: 0.3, max: 0.65 },
  bounds: { x: [-42, 42], y: [-18, 20], z: [-46, 6] },
  animation: {
    verticalSpeed: 0.02,
    horizontalSpeed: 0.01,
    rotationSpeed: 0.004,
    swayAmplitude: 2,
  },
};

export const FISH_COLORS = ['#38BDF8', '#60A5FA', '#14B8A6', '#0EA5E9'];

/**
 * Muted, desaturated coral. The original bright pink/salmon read as cartoonish
 * against the deep navy palette and fought the hero content for attention —
 * these sit in the same tonal family as the water instead of on top of it.
 * Coral the character keeps the brighter pinks; the scenery does not.
 */
export const CORAL_COLORS = ['#8C5A6E', '#9E6E62', '#6E5A7D'];

/**
 * Per-system frame budgets. Each system tracks its own last-update timestamp
 * and skips the expensive work between ticks, while cheap whole-group
 * transforms keep running every frame so nothing looks stuttery.
 */
export const UPDATE_INTERVALS = {
  particles: 1000 / 30,
  caustics: 1000 / 20,
  oceanFloor: 1000 / 15,
};
