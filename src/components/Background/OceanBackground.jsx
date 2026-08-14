import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import GradientBackground from './GradientBackground.jsx';
import CanvasOceanBackground from './CanvasOceanBackground.jsx';
import { useOcean } from '../../context/OceanContext.jsx';
import { isWebGLSupported } from '../../utils/deviceDetection.js';
import './background.css';

// Three.js is ~600KB — keep it out of the critical path so the page paints
// (gradient, waves, content) long before the scene arrives.
const ThreeOceanBackground = lazy(() => import('./ThreeOceanBackground.jsx'));

const TIER = {
  webgl: 'webgl',
  canvas2d: 'canvas2d',
  css: 'css',
};

/**
 * Fallback cascade:
 *   WebGL scene → 2D canvas ocean → plain gradient + CSS waves
 * Calm mode short-circuits straight to the last tier.
 */
export default function OceanBackground() {
  const { calm } = useOcean();
  const [tier, setTier] = useState(null);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    if (calm) {
      setTier(TIER.css);
      return;
    }
    setTier(isWebGLSupported() ? TIER.webgl : TIER.canvas2d);
  }, [calm]);

  const handleFail = useCallback(() => {
    setSceneReady(false);
    setTier((current) => (current === TIER.webgl ? TIER.canvas2d : TIER.css));
  }, []);

  const handleReady = useCallback(() => setSceneReady(true), []);

  return (
    <div className="ocean-layer">
      {/* Always present underneath: the page is never blank or black. */}
      <GradientBackground showWaves bubbleCount={calm ? 12 : 8} />

      {tier === TIER.webgl && (
        <div className={`ocean-layer__scene${sceneReady ? ' is-ready' : ''}`}>
          <Suspense fallback={null}>
            <ThreeOceanBackground onFail={handleFail} onReady={handleReady} />
          </Suspense>
        </div>
      )}

      {tier === TIER.canvas2d && (
        <div className="ocean-layer__scene is-ready">
          <CanvasOceanBackground />
        </div>
      )}
    </div>
  );
}
