import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { usePrefersReducedMotion } from '../hooks/useMediaQuery.js';

const STORAGE_KEY = 'pa-portfolio-calm';

const OceanContext = createContext(null);

/**
 * The ocean is the site — it is always on. What this context controls is how
 * *much* ocean: `calm` swaps the WebGL scene for a static gradient + CSS waves.
 *
 * Calm is opt-in, except for visitors who ask for reduced motion at the OS
 * level — they get it by default, and can still turn the full scene on.
 */
export function OceanProvider({ children }) {
  const reducedMotion = usePrefersReducedMotion();

  const [calm, setCalm] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) return saved === 'true';
    } catch {
      /* storage unavailable — fall through to the motion preference */
    }
    return false;
  });

  const [userChose, setUserChose] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  });

  // Honour the OS preference until the visitor overrides it themselves.
  useEffect(() => {
    if (!userChose && reducedMotion) setCalm(true);
  }, [reducedMotion, userChose]);

  useEffect(() => {
    document.documentElement.setAttribute('data-calm', String(calm));
  }, [calm]);

  const toggleCalm = useCallback(() => {
    setUserChose(true);
    setCalm((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* no persistence in private mode; the session still works */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ calm, immersive: !calm, toggleCalm, reducedMotion }),
    [calm, toggleCalm, reducedMotion]
  );

  return <OceanContext.Provider value={value}>{children}</OceanContext.Provider>;
}

OceanProvider.propTypes = {
  children: PropTypes.node,
};

export function useOcean() {
  const ctx = useContext(OceanContext);
  if (!ctx) throw new Error('useOcean must be used inside <OceanProvider>');
  return ctx;
}

export default OceanContext;
