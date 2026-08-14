import PropTypes from 'prop-types';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver.js';

/**
 * Scroll reveal. `delay` staggers siblings (typically index * 90ms) so lists
 * cascade in rather than appearing as one block.
 */
export default function FadeInSection({
  children,
  delay = 0,
  as = 'div',
  className = '',
  ...rest
}) {
  const Tag = as;
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <Tag
      ref={ref}
      className={`reveal${isVisible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

FadeInSection.propTypes = {
  children: PropTypes.node,
  delay: PropTypes.number,
  as: PropTypes.elementType,
  className: PropTypes.string,
};
