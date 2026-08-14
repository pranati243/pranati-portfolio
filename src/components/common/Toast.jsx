import { useEffect } from 'react';
import PropTypes from 'prop-types';
import './toast.css';

export default function Toast({ message, isOpen, onClose, duration = 4200 }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="toast glass" role="status" aria-live="polite">
      <span className="toast__icon" aria-hidden="true">
        🌊
      </span>
      <p className="toast__message">{message}</p>
      <button type="button" className="toast__close" onClick={onClose} aria-label="Dismiss">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.node,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number,
};
