import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useCoral } from '../../context/CoralContext.jsx';

/**
 * The floating entry point. Layered radial gradients build a lit glass sphere:
 * two halo rings, the orb itself with inset highlights, and a bright core.
 * Fades back during scroll so it never fights with the content.
 */
export default function CoralOrb({ isThinking = false }) {
  const { isOpen, toggle, unread } = useCoral();
  const [dimmed, setDimmed] = useState(false);

  useEffect(() => {
    let timer = null;
    const onScroll = () => {
      setDimmed(true);
      clearTimeout(timer);
      timer = setTimeout(() => setDimmed(false), 900);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const classes = [
    'coral-orb',
    isOpen ? 'is-open' : '',
    isThinking ? 'is-thinking' : '',
    dimmed && !isOpen ? 'is-dimmed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={toggle}
      aria-label={isOpen ? 'Close chat with Coral' : 'Chat with Coral, the AI guide'}
      aria-expanded={isOpen}
      aria-controls="coral-chat-panel"
    >
      <span className="coral-orb__glow-outer" aria-hidden="true" />
      <span className="coral-orb__glow-mid" aria-hidden="true" />
      <span className="coral-orb__sphere" aria-hidden="true">
        <span className="coral-orb__core" />
        <span className="coral-orb__shimmer" />
      </span>
      {isOpen ? (
        <svg className="coral-orb__icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      ) : (
        <span className="coral-orb__label" aria-hidden="true">
          Coral
        </span>
      )}
      {unread && !isOpen && <span className="coral-orb__badge" aria-hidden="true" />}
    </button>
  );
}

CoralOrb.propTypes = {
  isThinking: PropTypes.bool,
};
