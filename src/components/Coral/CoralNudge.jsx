import { useEffect, useState } from 'react';
import { useCoral } from '../../context/CoralContext.jsx';

const DISMISSED_KEY = 'pa-coral-nudge-dismissed';
const IDLE_DELAY_MS = 6500;
const SCROLL_TRIGGER_PX = 480;
const AUTO_HIDE_MS = 14000;

const wasDismissed = () => {
  try {
    return localStorage.getItem(DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
};

const remember = () => {
  try {
    localStorage.setItem(DISMISSED_KEY, 'true');
  } catch {
    /* private mode — they'll just see it again next visit */
  }
};

/**
 * A one-time pointer at the orb, because a glowing circle in the corner isn't
 * self-explanatory. Appears once the visitor has started reading (scrolled, or
 * sat still for a few seconds), never returns after it's been acted on, and
 * gets out of the way on its own.
 */
export default function CoralNudge() {
  const { open, isOpen } = useCoral();
  const [visible, setVisible] = useState(false);
  const [retired, setRetired] = useState(() => wasDismissed());

  // Opening the chat is the strongest possible "message received".
  useEffect(() => {
    if (isOpen) {
      setVisible(false);
      setRetired(true);
      remember();
    }
  }, [isOpen]);

  useEffect(() => {
    if (retired) return undefined;

    const reveal = () => setVisible(true);

    const timer = setTimeout(reveal, IDLE_DELAY_MS);
    const onScroll = () => {
      if (window.scrollY > SCROLL_TRIGGER_PX) reveal();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [retired]);

  useEffect(() => {
    if (!visible) return undefined;
    const timer = setTimeout(() => setVisible(false), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  if (retired) return null;

  const dismiss = (event) => {
    event.stopPropagation();
    setVisible(false);
    setRetired(true);
    remember();
  };

  return (
    <div className={`coral-nudge${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
      <button
        type="button"
        className="coral-nudge__bubble glass"
        onClick={open}
        tabIndex={visible ? 0 : -1}
      >
        <span className="coral-nudge__sparkle" aria-hidden="true">
          🪸
        </span>
        <span className="coral-nudge__copy">
          <strong>That&rsquo;s Coral</strong>
          <span>Ask her anything about Pranati</span>
        </span>
        <span
          className="coral-nudge__close"
          onClick={dismiss}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') dismiss(event);
          }}
          role="button"
          tabIndex={visible ? 0 : -1}
          aria-label="Dismiss"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {/* Curved arrow that lands on the orb. */}
      <svg className="coral-nudge__arrow" viewBox="0 0 90 70" aria-hidden="true">
        <path
          className="coral-nudge__arrow-path"
          d="M6 10 C 34 8, 62 20, 72 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="5 6"
        />
        <path
          d="M64 40 L73 52 L59 53"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
