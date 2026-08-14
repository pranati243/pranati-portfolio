import { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useFrame } from '@react-three/fiber';

/**
 * A strand of kelp built from stacked segments, each lagging slightly behind
 * the one below it. That per-segment phase offset is what produces the whip
 * of a current running up the plant.
 */
export default function Kelp({ position = [0, -10, -12], height = 7, animate = true }) {
  const segmentRefs = useRef([]);
  const phase = useRef(Math.random() * Math.PI * 2);

  const segments = useMemo(() => {
    const count = 7;
    const segmentHeight = height / count;
    return Array.from({ length: count }, (_, i) => ({
      key: i,
      height: segmentHeight,
      radiusTop: 0.09 - (i / count) * 0.055,
      radiusBottom: 0.11 - (i / count) * 0.055,
    }));
  }, [height]);

  useFrame((state) => {
    if (!animate) return;
    const t = state.clock.elapsedTime;
    segmentRefs.current.forEach((ref, i) => {
      if (ref) ref.rotation.z = Math.sin(t * 0.6 + phase.current + i * 0.45) * 0.14;
    });
  });

  // Each segment is nested inside the previous one, so rotations compound
  // up the strand the way a real stem bends.
  const build = (index) => {
    if (index >= segments.length) return null;
    const segment = segments[index];
    return (
      <group
        ref={(el) => {
          segmentRefs.current[index] = el;
        }}
        position={[0, index === 0 ? 0 : segments[index - 1].height, 0]}
      >
        <mesh position={[0, segment.height / 2, 0]}>
          <cylinderGeometry
            args={[segment.radiusTop, segment.radiusBottom, segment.height, 6]}
          />
          <meshStandardMaterial
            color="#1f7a5a"
            emissive="#0d3f30"
            emissiveIntensity={0.4}
            roughness={0.8}
          />
        </mesh>
        {build(index + 1)}
      </group>
    );
  };

  return <group position={position}>{build(0)}</group>;
}

Kelp.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  height: PropTypes.number,
  animate: PropTypes.bool,
};
