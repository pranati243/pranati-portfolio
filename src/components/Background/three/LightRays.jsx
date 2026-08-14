import { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, DoubleSide } from 'three';

/**
 * Sun shafts breaking through the surface. Wide, very low-opacity cones with
 * additive blending — the trick is keeping opacity under ~0.08 so they read as
 * light rather than as geometry.
 */
export default function LightRays({ count = 6, animate = true }) {
  const groupRef = useRef(null);

  const rays = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        key: i,
        x: -14 + (i / Math.max(count - 1, 1)) * 28 + (Math.random() - 0.5) * 2,
        z: -16 - Math.random() * 12,
        height: 26 + Math.random() * 10,
        radius: 1.1 + Math.random() * 1.4,
        tilt: 0.08 + Math.random() * 0.12,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.035 + Math.random() * 0.04,
      })),
    [count]
  );

  const rayRefs = useRef([]);

  useFrame((state) => {
    if (!animate) return;
    const t = state.clock.elapsedTime;
    rayRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const ray = rays[i];
      ref.rotation.z = ray.tilt + Math.sin(t * 0.18 + ray.phase) * 0.06;
      ref.position.x = ray.x + Math.sin(t * 0.12 + ray.phase) * 0.7;
    });
  });

  return (
    <group ref={groupRef}>
      {rays.map((ray, i) => (
        <mesh
          key={ray.key}
          ref={(el) => {
            rayRefs.current[i] = el;
          }}
          position={[ray.x, 6, ray.z]}
          rotation={[0, 0, ray.tilt]}
        >
          <coneGeometry args={[ray.radius, ray.height, 8, 1, true]} />
          <meshBasicMaterial
            color="#8fdcff"
            transparent
            opacity={ray.opacity}
            blending={AdditiveBlending}
            depthWrite={false}
            side={DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

LightRays.propTypes = {
  count: PropTypes.number,
  animate: PropTypes.bool,
};
