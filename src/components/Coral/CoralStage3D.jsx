import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Canvas } from '@react-three/fiber';
import CoralCharacter from './CoralCharacter.jsx';
import { getPixelRatio } from '../../utils/deviceDetection.js';

/**
 * Coral's canvas and everything in it.
 *
 * Canvas and CoralCharacter are BOTH imported normally here, on purpose.
 * They used to be separate React.lazy components with the <Suspense> boundary
 * sitting outside <Canvas> — which silently broke: R3F runs its own
 * reconciler root, so a DOM-level Suspense boundary cannot catch a promise
 * thrown by a lazy child inside the canvas. The R3F tree never committed and
 * the stage rendered empty with no error to show for it.
 *
 * Keeping one lazy boundary around this whole module (see CoralAvatar3D)
 * still code-splits three.js out of the initial bundle, without straddling
 * the reconciler boundary.
 */
export default function CoralStage3D({ mood, gaze, onContextLost }) {
  const handleCreated = useCallback(
    ({ gl }) => {
      const canvas = gl.domElement;
      const onLost = (event) => {
        // Prevent default so the browser will let the context be restored,
        // then hand control back so we can swap in the 2D mascot.
        event.preventDefault();
        onContextLost?.();
      };
      canvas.addEventListener('webglcontextlost', onLost);
    },
    [onContextLost]
  );

  return (
    <Canvas
      className="coral-stage__canvas"
      dpr={[1, getPixelRatio(2)]}
      camera={{ fov: 34, position: [0, 0, 6.4], near: 0.1, far: 40 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      style={{ pointerEvents: 'none' }}
      onCreated={handleCreated}
    >
      <ambientLight intensity={1.15} color="#cfeeff" />
      <directionalLight position={[3, 4, 6]} intensity={2.4} color="#ffffff" />
      <pointLight position={[-3.5, -1.5, 3]} intensity={26} color="#38bdf8" />
      <pointLight position={[2.5, 2.5, -2]} intensity={14} color="#ff8fb3" />
      <CoralCharacter mood={mood} gaze={gaze} />
    </Canvas>
  );
}

CoralStage3D.propTypes = {
  mood: PropTypes.oneOf(['idle', 'thinking', 'speaking']),
  gaze: PropTypes.shape({ current: PropTypes.object }),
  onContextLost: PropTypes.func,
};
