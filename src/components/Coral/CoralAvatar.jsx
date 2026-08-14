import PropTypes from 'prop-types';

/**
 * Coral's face — an inline SVG coral branch with eyes, no image asset.
 * The eyes blink and drift on their own timers so she reads as alive even
 * while idle; the glow filter animates while she's thinking.
 */
export default function CoralAvatar({ size = 48, isThinking = false }) {
  return (
    <span
      className={`coral-avatar${isThinking ? ' is-thinking' : ''}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id="coral-body" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ff6b9d" />
            <stop offset="60%" stopColor="#ffa07a" />
            <stop offset="100%" stopColor="#ffb6c1" />
          </linearGradient>
          <filter id="coral-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#coral-glow)" stroke="url(#coral-body)" strokeLinecap="round" fill="none">
          <path d="M32 58V34" strokeWidth="7" />
          <path d="M32 42c-4-4-9-5-11-11" strokeWidth="5" />
          <path d="M32 40c4-5 9-6 11-13" strokeWidth="5" />
          <path d="M32 34c-2-4-2-8 0-12" strokeWidth="4.5" />
          <path d="M24 32c-2-3-2-6-1-9" strokeWidth="3.5" />
          <path d="M41 30c2-3 2-6 1-9" strokeWidth="3.5" />
        </g>

        <g fill="#38BDF8" opacity="0.9">
          <circle cx="21" cy="21" r="2.4" />
          <circle cx="43" cy="20" r="2.1" />
          <circle cx="32" cy="19" r="2" />
        </g>

        {/* eyes */}
        <g className="coral-avatar__eyes">
          <g className="coral-avatar__eye">
            <ellipse cx="27" cy="41" rx="4.4" ry="4.8" fill="#ffffff" />
            <circle cx="28" cy="42" r="2.1" fill="#0a2540" />
            <circle cx="28.9" cy="41" r="0.75" fill="#ffffff" />
          </g>
          <g className="coral-avatar__eye">
            <ellipse cx="38" cy="41" rx="4.4" ry="4.8" fill="#ffffff" />
            <circle cx="39" cy="42" r="2.1" fill="#0a2540" />
            <circle cx="39.9" cy="41" r="0.75" fill="#ffffff" />
          </g>
        </g>
      </svg>
    </span>
  );
}

CoralAvatar.propTypes = {
  size: PropTypes.number,
  isThinking: PropTypes.bool,
};
