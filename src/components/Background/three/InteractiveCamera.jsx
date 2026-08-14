import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils } from 'three';
import { CAMERA_CONFIG } from './config.js';
import { getScrollProgress } from '../../../utils/scrollUtils.js';

/**
 * Parallax on pointer move + a descent as the page scrolls, so reading the
 * portfolio feels like sinking. All interpolated with lerp — no tween library.
 */
export default function InteractiveCamera({ animate = true }) {
  const { camera } = useThree();
  const target = useRef({ rotX: 0, rotY: 0, z: CAMERA_CONFIG.position[2], y: 0 });

  useEffect(() => {
    if (!animate) {
      target.current = { rotX: 0, rotY: 0, z: CAMERA_CONFIG.position[2], y: 0 };
      return undefined;
    }

    const maxRotation = MathUtils.degToRad(CAMERA_CONFIG.mouse.maxRotationDeg);

    const onPointerMove = (event) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = (event.clientY / window.innerHeight) * 2 - 1;
      target.current.rotY = -nx * maxRotation;
      target.current.rotX = -ny * maxRotation;
    };

    const onScroll = () => {
      const progress = getScrollProgress();
      const { minZ, maxZ, minY, maxY } = CAMERA_CONFIG.scroll;
      target.current.z = MathUtils.lerp(minZ, maxZ, progress);
      target.current.y = MathUtils.lerp(minY, maxY, progress);
    };

    onScroll();
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, [animate]);

  useFrame(() => {
    const { lerpFactor } = CAMERA_CONFIG.mouse;
    const t = target.current;

    camera.position.z = MathUtils.lerp(camera.position.z, t.z, CAMERA_CONFIG.scroll.lerpFactor);
    camera.position.y = MathUtils.lerp(camera.position.y, t.y, CAMERA_CONFIG.scroll.lerpFactor);
    camera.position.x = MathUtils.lerp(camera.position.x, t.rotY * 6, lerpFactor);

    // Always re-centre on the origin after moving, so the scene stays framed.
    camera.lookAt(0, t.y * 0.6, 0);
    camera.rotation.z = MathUtils.lerp(camera.rotation.z, t.rotX * 0.3, lerpFactor);
  });

  return null;
}

InteractiveCamera.propTypes = {
  animate: PropTypes.bool,
};
