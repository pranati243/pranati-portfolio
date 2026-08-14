import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Canvas } from '@react-three/fiber';
import UnderwaterScene from './three/UnderwaterScene.jsx';
import { CAMERA_CONFIG } from './three/config.js';
import { getPerformanceConfig, getPixelRatio } from '../../utils/deviceDetection.js';

/**
 * Anything thrown while rendering the scene (a driver bug, an out-of-memory
 * context) drops the whole 3D layer instead of blanking the page.
 */
class ThreeErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn('[ocean] 3D scene failed, falling back:', error?.message);
    this.props.onFail?.();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

ThreeErrorBoundary.propTypes = {
  children: PropTypes.node,
  onFail: PropTypes.func,
};

export default function ThreeOceanBackground({ onFail, onReady }) {
  const config = useMemo(() => getPerformanceConfig(), []);
  const canvasWrapperRef = useRef(null);
  const [contextLost, setContextLost] = useState(false);

  const handleCreated = useCallback(
    (state) => {
      const canvas = state.gl.domElement;

      const onLost = (event) => {
        event.preventDefault();
        setContextLost(true);
        onFail?.();
      };

      canvas.addEventListener('webglcontextlost', onLost);
      canvas.__oceanCleanup = () => canvas.removeEventListener('webglcontextlost', onLost);

      onReady?.();
    },
    [onFail, onReady]
  );

  useEffect(
    () => () => {
      const canvas = canvasWrapperRef.current?.querySelector('canvas');
      canvas?.__oceanCleanup?.();
    },
    []
  );

  if (contextLost) return null;

  return (
    <div ref={canvasWrapperRef} className="ocean-canvas" aria-hidden="true" role="presentation">
      <ThreeErrorBoundary onFail={onFail}>
        <Canvas
          dpr={[1, getPixelRatio(2)]}
          camera={{
            fov: CAMERA_CONFIG.fov,
            near: CAMERA_CONFIG.near,
            far: CAMERA_CONFIG.far,
            position: CAMERA_CONFIG.position,
          }}
          gl={{
            alpha: false,
            antialias: config.antialias,
            powerPreference: config.powerPreference,
            failIfMajorPerformanceCaveat: false,
            preserveDrawingBuffer: false,
            stencil: false,
            depth: true,
          }}
          onCreated={handleCreated}
          frameloop="always"
        >
          <Suspense fallback={null}>
            <UnderwaterScene config={config} />
          </Suspense>
        </Canvas>
      </ThreeErrorBoundary>
    </div>
  );
}

ThreeOceanBackground.propTypes = {
  onFail: PropTypes.func,
  onReady: PropTypes.func,
};
