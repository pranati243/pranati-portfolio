import { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useFrame } from '@react-three/fiber';
import { CORAL_COLORS } from './config.js';

/**
 * A small coral cluster: three tapered branches that sway out of phase, topped
 * with glowing polyps. Deliberately low-poly — there are seven of these.
 */
export default function CoralReef({ position = [0, 0, 0], scale = 1, animate = true }) {
  const branchRefs = useRef([]);
  const phase = useRef(Math.random() * Math.PI * 2);

  const branches = useMemo(
    () =>
      CORAL_COLORS.map((color, i) => ({
        color,
        offsetX: (i - 1) * 0.32,
        offsetZ: (i % 2 === 0 ? 1 : -1) * 0.16,
        height: 1.1 + Math.random() * 0.9,
        tilt: (Math.random() - 0.5) * 0.35,
      })),
    []
  );

  const polyps = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return { key: i, x: Math.cos(angle) * 0.36, z: Math.sin(angle) * 0.36 };
      }),
    []
  );

  useFrame((state) => {
    if (!animate) return;
    const t = state.clock.elapsedTime + phase.current;
    branchRefs.current.forEach((ref, i) => {
      if (ref) ref.rotation.z = Math.sin(t * 0.8 + i * 0.5) * 0.1;
    });
  });

  return (
    <group position={position} scale={scale}>
      {branches.map((branch, i) => (
        <group
          key={branch.color}
          ref={(el) => {
            branchRefs.current[i] = el;
          }}
          position={[branch.offsetX, 0, branch.offsetZ]}
          rotation={[0, 0, branch.tilt]}
        >
          <mesh position={[0, branch.height / 2, 0]}>
            <cylinderGeometry args={[0.07, 0.17, branch.height, 7]} />
            <meshStandardMaterial
              color={branch.color}
              emissive={branch.color}
              emissiveIntensity={0.12}
              roughness={0.75}
            />
          </mesh>
          <mesh position={[0.14, branch.height * 0.72, 0]} rotation={[0, 0, -0.7]}>
            <cylinderGeometry args={[0.04, 0.08, branch.height * 0.45, 6]} />
            <meshStandardMaterial
              color={branch.color}
              emissive={branch.color}
              emissiveIntensity={0.12}
              roughness={0.75}
            />
          </mesh>
        </group>
      ))}

      {polyps.map((polyp) => (
        <mesh key={polyp.key} position={[polyp.x, 1.5, polyp.z]}>
          <sphereGeometry args={[0.075, 8, 8]} />
          <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={1.1} />
        </mesh>
      ))}
    </group>
  );
}

CoralReef.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  scale: PropTypes.number,
  animate: PropTypes.bool,
};
