import { lazy, Suspense, Component, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import CoralAvatar from './CoralAvatar.jsx';
import { isWebGLSupported, getPixelRatio } from '../../utils/deviceDetection.js';
import { useOcean } from '../../context/OceanContext.jsx';

// Its own chunk, loaded only when someone actually opens the chat.
const Canvas = lazy(() =>
  import('@react-three/fiber').then((module) => ({ default: module.Canvas }))
);
const CoralCharacter = lazy(() => import('./CoralCharacter.jsx'));

/** If the character throws, drop to the flat SVG mascot instead of the panel. */
class AvatarErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
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
 * reduced motion or missing WebGL.
 */
export default function CoralAvatar3D({ mood = 'idle', active = false }) {
  const { calm, reducedMotion } = useOcean();
  const gaze = useRef({ x: 0, y: 0 });
  const [webgl, setWebgl] = useState(null);

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

  const flat = useMemo(
    () => (
      <div className="coral-stage__flat">
        <CoralAvatar size={92} isThinking={mood === 'thinking'} />
      </div>
    ),
    [mood]
  );

  const use3D = active && webgl && !calm && !reducedMotion;

  return (
    <div className={`coral-stage${mood === 'thinking' ? ' is-thinking' : ''}`}>
      <div className="coral-stage__light" aria-hidden="true" />

      {use3D ? (
        <AvatarErrorBoundary fallback={flat}>
          <Suspense fallback={flat}>
            <Canvas
              className="coral-stage__canvas"
              dpr={[1, getPixelRatio(2)]}
              camera={{ fov: 34, position: [0, 0, 6.4], near: 0.1, far: 40 }}
              gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
              style={{ pointerEvents: 'none' }}
            >
              <ambientLight intensity={1.15} color="#cfeeff" />
              <directionalLight position={[3, 4, 6]} intensity={2.4} color="#ffffff" />
              <pointLight position={[-3.5, -1.5, 3]} intensity={26} color="#38bdf8" />
              <pointLight position={[2.5, 2.5, -2]} intensity={14} color="#ff8fb3" />
              <CoralCharacter mood={mood} gaze={gaze} />
            </Canvas>
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
