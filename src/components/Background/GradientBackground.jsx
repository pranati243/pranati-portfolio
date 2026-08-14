import { useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * The base water column. Always rendered, behind everything else — it is what
 * keeps the page looking like the ocean while the WebGL scene is still
 * compiling, and it is the entire background in calm mode.
 */
export default function GradientBackground({ showWaves = true, bubbleCount = 9 }) {
  const bubbles = useMemo(
    () =>
      Array.from({ length: bubbleCount }, (_, i) => ({
        key: i,
        left: `${4 + (i * 92) / bubbleCount + Math.random() * 5}%`,
        size: `${8 + Math.random() * 22}px`,
        duration: `${13 + Math.random() * 12}s`,
        delay: `${-Math.random() * 20}s`,
        drift: `${(Math.random() - 0.5) * 90}px`,
      })),
    [bubbleCount]
  );

  return (
    <div className="ocean-bg" aria-hidden="true">
      <div className="ocean-bg__gradient" />

      {showWaves && (
        <div className="ocean-bg__surface">
          {/* Two offset copies of one wave path scrolled at different speeds —
              cheapest convincing parallax there is. */}
          <svg
            className="ocean-bg__wave ocean-bg__wave--back"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C180,110 360,10 540,55 C720,100 900,20 1080,58 C1260,96 1380,50 1440,42 L1440,0 L0,0 Z"
              fill="rgba(120, 215, 255, 0.16)"
            />
          </svg>
          <svg
            className="ocean-bg__wave ocean-bg__wave--front"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,48 C160,96 340,4 520,46 C700,88 880,8 1060,52 C1240,96 1370,44 1440,34 L1440,0 L0,0 Z"
              fill="rgba(56, 189, 248, 0.22)"
            />
          </svg>
        </div>
      )}

      <ul className="ocean-bg__bubbles">
        {bubbles.map((bubble) => (
          <li
            key={bubble.key}
            className="ocean-bg__bubble"
            style={{
              left: bubble.left,
              width: bubble.size,
              height: bubble.size,
              animationDuration: bubble.duration,
              animationDelay: bubble.delay,
              '--drift': bubble.drift,
            }}
          />
        ))}
      </ul>

      <div className="ocean-bg__vignette" />
    </div>
  );
}

GradientBackground.propTypes = {
  showWaves: PropTypes.bool,
  bubbleCount: PropTypes.number,
};
