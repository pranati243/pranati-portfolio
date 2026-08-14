import { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useFrame } from '@react-three/fiber';

const TENTACLE_COUNT = 6;

/**
 * Translucent bell that pulses like it's actually propelling itself, with
 * tentacles that lag behind the bell's rhythm.
 */
export default function FloatingJellyfish({
  position = [0, 0, 0],
  speed = 0.5,
  scale = 1,
  color = '#38BDF8',
  animate = true,
}) {
  const groupRef = useRef(null);
  const bellRef = useRef(null);
  const tentacleRefs = useRef([]);
  const phase = useRef(Math.random() * Math.PI * 2);

  const tentacles = useMemo(
    () =>
      Array.from({ length: TENTACLE_COUNT }, (_, i) => {
        const angle = (i / TENTACLE_COUNT) * Math.PI * 2;
        return {
          key: i,
          x: Math.cos(angle) * 0.22,
          z: Math.sin(angle) * 0.22,
          length: 0.9 + Math.random() * 0.5,
        };
      }),
    []
  );

  useFrame((state) => {
    const group = groupRef.current;
    if (!group || !animate) return;

    const t = state.clock.elapsedTime * speed + phase.current;

    group.position.y = position[1] + Math.sin(t) * 0.55;
    group.position.x = position[0] + Math.sin(t * 0.3) * 0.35;

    if (bellRef.current) {
      const pulse = 1 + Math.sin(t * 2) * 0.1;
      bellRef.current.scale.set(pulse, 1 / pulse, pulse);
    }

    tentacleRefs.current.forEach((ref, i) => {
      if (ref) ref.rotation.z = Math.sin(t * 3 + i) * 0.22;
    });
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh ref={bellRef}>
        <sphereGeometry args={[0.5, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.55}
          transparent
          opacity={0.42}
          roughness={0.2}
        />
      </mesh>

      {/* inner glow core, visible through the bell */}
      <mesh position={[0, 0.12, 0]} scale={0.55}>
        <sphereGeometry args={[0.32, 12, 10]} />
        <meshBasicMaterial color="#d8f6ff" transparent opacity={0.25} />
      </mesh>

      {tentacles.map((tentacle, i) => (
        <group
          key={tentacle.key}
          ref={(el) => {
            tentacleRefs.current[i] = el;
          }}
          position={[tentacle.x, 0, tentacle.z]}
        >
          <mesh position={[0, -tentacle.length / 2, 0]}>
            <cylinderGeometry args={[0.018, 0.005, tentacle.length, 5]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.4}
              transparent
              opacity={0.55}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

FloatingJellyfish.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  speed: PropTypes.number,
  scale: PropTypes.number,
  color: PropTypes.string,
  animate: PropTypes.bool,
};
