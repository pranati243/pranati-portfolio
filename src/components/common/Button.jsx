import { useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Button with a Material-style ripple. The ripple span is created imperatively
 * rather than kept in state — it is pure decoration and re-rendering the tree
 * for it would be wasteful.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  as = 'button',
  className = '',
  onClick,
  ...rest
}) {
  const Tag = as;

  const handleClick = useCallback(
    (event) => {
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      const diameter = Math.max(rect.width, rect.height);

      const ripple = document.createElement('span');
      ripple.className = 'btn__ripple';
      ripple.style.width = `${diameter}px`;
      ripple.style.height = `${diameter}px`;
      ripple.style.left = `${event.clientX - rect.left - diameter / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - diameter / 2}px`;

      target.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);

      onClick?.(event);
    },
    [onClick]
  );

  const classes = [
    'btn',
    `btn--${variant}`,
    size !== 'medium' ? `btn--${size}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} onClick={handleClick} {...rest}>
      {children}
    </Tag>
  );
}

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  as: PropTypes.elementType,
  className: PropTypes.string,
  onClick: PropTypes.func,
};
