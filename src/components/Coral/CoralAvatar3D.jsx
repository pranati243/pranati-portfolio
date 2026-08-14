import { lazy, Suspense, Component, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import CoralAvatar from './CoralAvatar.jsx';
import { isWebGLSupported } from '../../utils/deviceDetection.js';
import { useOcean } from '../../context/OceanContext.jsx';

// One lazy boundary, wrapping the canvas AND its contents together, so three.js
// stays out of the initial bundle without splitting across R3F's reconciler.
const CoralStage3D = lazy(() => import('./CoralStage3D.jsx'));

/** If the scene throws while rendering, drop to the flat SVG mascot. */
class AvatarErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn('[coral] 3D avatar failed, using flat mascot:', error?.message);
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

AvatarErrorBoundary.propTypes = {
  children: PropTypes.node,
  fallback: PropTypes.node,
};

/**
 * The stage Coral performs on, at the top of the chat panel.
 *
 * Only mounts while the panel is open so we aren't holding a second WebGL
 * context for the whole session, and falls back to the 2D mascot on calm mode,
 * reduced motion, missing WebGL, or a lost context.
 */
export default function CoralAvatar3D({ mood = 'idle', active = false }) {
  const { calm, reducedMotion } = useOcean();
  const gaze = useRef({ x: 0, y: 0 });
  const [webgl, setWebgl] = useState(null);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    if (webgl === null) setWebgl(isWebGLSupported());
  }, [webgl]);

  // Track the pointer globally so she watches the cursor anywhere on the page,
  // not only while it is over her canvas. A ref, so no re-render per move.
  useEffect(() => {
    if (!active) return undefined;

    const onMove = (event) => {
      gaze.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -((event.clientY / window.innerHeight) * 2 - 1),
      };
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [active]);

  // A context lost while closed may well be recoverable next time it opens.
  useEffect(() => {
    if (!active) setContextLost(false);
  }, [active]);

  const handleContextLost = useCallback(() => {
    console.warn('[coral] WebGL context lost, using flat mascot');
    setContextLost(true);
  }, []);

  const flat = useMemo(
    () => (
      <div className="coral-stage__flat">
        <CoralAvatar size={92} isThinking={mood === 'thinking'} />
      </div>
    ),
    [mood]
  );

  const use3D = active && webgl && !calm && !reducedMotion && !contextLost;

  return (
    <div className={`coral-stage${mood === 'thinking' ? ' is-thinking' : ''}`}>
      <div className="coral-stage__light" aria-hidden="true" />

      {use3D ? (
        <AvatarErrorBoundary fallback={flat}>
          <Suspense fallback={flat}>
            <CoralStage3D mood={mood} gaze={gaze} onContextLost={handleContextLost} />
          </Suspense>
        </AvatarErrorBoundary>
      ) : (
        flat
      )}
    </div>
  );
}

CoralAvatar3D.propTypes = {
  mood: PropTypes.oneOf(['idle', 'thinking', 'speaking']),
  active: PropTypes.bool,
};
