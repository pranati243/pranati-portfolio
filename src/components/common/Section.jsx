import PropTypes from 'prop-types';
import FadeInSection from './FadeInSection.jsx';

/**
 * Every content section on the page uses this one wrapper — glass panel,
 * eyebrow, title, lead. The old codebase branched between a plain <section>
 * and a transparent one in five different components; here the ocean is
 * always on, so there is only one path.
 */
export default function Section({ id, eyebrow, title, lead, children, wide = false }) {
  const headingId = `${id}-heading`;

  return (
    <section id={id} className="section" aria-labelledby={headingId}>
      <div className="container" style={wide ? { maxWidth: '1320px' } : undefined}>
        <FadeInSection className="section__panel glass">
          <header className="section__header">
            {eyebrow && <p className="section__eyebrow">{eyebrow}</p>}
            <h2 id={headingId} className="section__title">
              {title}
            </h2>
            {lead && <p className="section__lead">{lead}</p>}
          </header>
          {children}
        </FadeInSection>
      </div>
    </section>
  );
}

Section.propTypes = {
  id: PropTypes.string.isRequired,
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  lead: PropTypes.string,
  children: PropTypes.node,
  wide: PropTypes.bool,
};
