import { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useFrame } from '@react-three/fiber';
import { DoubleSide } from 'three';
import SimplexNoise from './simplexNoise.js';
import { COLOR_PALETTE, UPDATE_INTERVALS } from './config.js';

/**
 * A gently rolling seabed. Vertex Z is re-noised on a 15fps budget — the
 * displacement is slow enough that a higher rate would be invisible, and
 * computeVertexNormals() over 4k vertices is the expensive part.
 */
export default function OceanFloor({ animate = true }) {
  const meshRef = useRef(null);
  const timeRef = useRef(0);
  const lastUpdateRef = useRef(0);
  const simplex = useMemo(() => new SimplexNoise(4212), []);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh || !animate) return;

    const elapsedMs = state.clock.elapsedTime * 1000;
    if (elapsedMs - lastUpdateRef.current < UPDATE_INTERVALS.oceanFloor) return;
    lastUpdateRef.current = elapsedMs;

    timeRef.current += delta * 0.2;
    const t = timeRef.current;

    const position = mesh.geometry.attributes.position;
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      position.setZ(i, simplex.noise(x * 0.05 + t, y * 0.05 + t * 0.8) * 0.6);
    }

    position.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, -10]}>
      <planeGeometry args={[120, 120, 56, 56]} />
      <meshStandardMaterial
        color={COLOR_PALETTE.seabed}
        roughness={0.85}
        metalness={0.15}
        side={DoubleSide}
      />
    </mesh>
  );
}

OceanFloor.propTypes = {
  animate: PropTypes.bool,
};
