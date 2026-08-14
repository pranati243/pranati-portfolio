import { useRef } from 'react';
import PropTypes from 'prop-types';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

const scratch = new Vector3();

/**
 * A stylised fish: squashed sphere body, cone tail, two fins.
 * Swims a figure-eight around its anchor point and turns to face where it is
 * heading, which is what stops it reading as a floating object.
 */
export default function SwimmingFish({
  position = [0, 0, 0],
  speed = 1,
  scale = 1,
  color = '#38BDF8',
  animate = true,
}) {
  const groupRef = useRef(null);
  const tailRef = useRef(null);
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group || !animate) return;

    const t = state.clock.elapsedTime * speed + phase.current;

    const x = position[0] + Math.sin(t * 0.5) * 3;
    const y = position[1] + Math.sin(t * 0.3) * 1.4;
    const z = position[2] + Math.cos(t * 0.5) * 3;

    // Look one step ahead along the same path so the fish banks into turns.
    const ahead = 0.08;
    scratch.set(
      position[0] + Math.sin((t + ahead) * 0.5) * 3,
      position[1] + Math.sin((t + ahead) * 0.3) * 1.4,
      position[2] + Math.cos((t + ahead) * 0.5) * 3
    );

    group.position.set(x, y, z);
    group.lookAt(scratch);

    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 8) * 0.4;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* body */}
      <mesh scale={[0.55, 0.34, 0.9]}>
        <sphereGeometry args={[0.42, 16, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.32}
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>

      {/* tail */}
      <group ref={tailRef} position={[0, 0, -0.42]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.22, 0.42, 4]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.45}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* side fins */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.2, 0, 0.02]} rotation={[0, 0, side * 0.5]}>
          <coneGeometry args={[0.09, 0.28, 3]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.35}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

SwimmingFish.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  speed: PropTypes.number,
  scale: PropTypes.number,
  color: PropTypes.string,
  animate: PropTypes.bool,
};
