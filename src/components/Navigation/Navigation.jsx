import { useCallback, useEffect, useMemo, useState } from 'react';
import { useScrollSpy } from '../../hooks/useScrollSpy.js';
import { useOcean } from '../../context/OceanContext.jsx';
import { scrollToSection, scrollToTop } from '../../utils/scrollUtils.js';
import './navigation.css';

const LINKS = [
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'about', label: 'About' },
  { id: 'resume', label: 'Resume' },
  { id: 'contact', label: 'Contact' },
];

const SECTION_IDS = LINKS.map((link) => link.id);

export default function Navigation() {
  const { calm, toggleCalm } = useOcean();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ids = useMemo(() => SECTION_IDS, []);
  const activeId = useScrollSpy(ids);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock the page behind the mobile menu, and let Escape dismiss it.
  useEffect(() => {
    if (!menuOpen) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const go = useCallback((id) => {
    setMenuOpen(false);
    scrollToSection(id);
  }, []);

  return (
    <>
      <header className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
        <nav className="nav__inner glass" aria-label="Main">
          <button type="button" className="nav__logo" onClick={scrollToTop}>
            <span className="nav__logo-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="22" height="22">
                <path
                  d="M2 20c4 0 4-5 8-5s4 5 8 5 4-5 8-5 4 5 6 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M2 27c4 0 4-5 8-5s4 5 8 5 4-5 8-5 4 5 6 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.5"
                />
                <circle cx="12" cy="8" r="2.6" fill="currentColor" />
                <circle cx="21" cy="5" r="1.6" fill="currentColor" opacity="0.7" />
              </svg>
            </span>
            <span className="nav__logo-text">Pranati Arun</span>
          </button>

          <ul className="nav__links">
            {LINKS.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  className={`nav__link${activeId === link.id ? ' is-active' : ''}`}
                  onClick={() => go(link.id)}
                  aria-current={activeId === link.id ? 'true' : undefined}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="nav__actions">
            <button
              type="button"
              className="nav__calm"
              onClick={toggleCalm}
              aria-pressed={calm}
              title={calm ? 'Turn the 3D ocean back on' : 'Switch to calm water (less motion)'}
            >
              <span className="nav__calm-icon" aria-hidden="true">
                {calm ? (
                  <svg viewBox="0 0 24 24" width="17" height="17">
                    <path
                      d="M2 12c3 0 3-4 6-4s3 4 6 4 3-4 6-4 2.5 4 4 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M2 18c3 0 3-4 6-4s3 4 6 4 3-4 6-4 2.5 4 4 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.55"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="17" height="17">
                    <path
                      d="M3 10h18M3 15h18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </span>
              <span className="nav__calm-label">{calm ? 'Calm water' : 'Deep dive'}</span>
            </button>

            <button
              type="button"
              className={`nav__burger${menuOpen ? ' is-open' : ''}`}
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`mobile-menu${menuOpen ? ' is-open' : ''}`}
        id="mobile-menu"
        hidden={!menuOpen}
      >
        <button
          type="button"
          className="mobile-menu__backdrop"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
          tabIndex={-1}
        />
        <nav className="mobile-menu__panel glass" aria-label="Mobile">
          <ul>
            {LINKS.map((link, index) => (
              <li key={link.id} style={{ transitionDelay: `${index * 45}ms` }}>
                <button
                  type="button"
                  className={`mobile-menu__link${activeId === link.id ? ' is-active' : ''}`}
                  onClick={() => go(link.id)}
                >
                  <span className="mobile-menu__index">0{index + 1}</span>
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
