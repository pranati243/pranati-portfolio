import { useEffect } from 'react';
import PropTypes from 'prop-types';

/** Free-floating tooltip anchored to a screen position — used by easter eggs. */
export default function Tooltip({ message, position, isOpen, onClose, duration = 2600 }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  // Keep the bubble on screen when the cursor is near an edge.
  const left = Math.min(Math.max(position.x + 14, 12), window.innerWidth - 292);
  const top = Math.min(Math.max(position.y + 14, 12), window.innerHeight - 80);

  return (
    <div className="tooltip" role="tooltip" style={{ left, top }}>
      {message}
    </div>
  );
}

Tooltip.propTypes = {
  message: PropTypes.node,
  position: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number,
};
