import { useRef } from 'react';
import PropTypes from 'prop-types';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

const scratch = new Vector3();

/**
 * The scene's one large creature — a sea turtle on a slow, wide circuit.
 * Front and rear flippers beat in opposition, which is what makes the motion
 * read as swimming rather than gliding.
 */
export default function SwimmingTurtle({
  position = [0, 0, -10],
  speed = 0.2,
  scale = 1,
  animate = true,
}) {
  const groupRef = useRef(null);
  const flipperRefs = useRef([]);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group || !animate) return;

    const t = state.clock.elapsedTime * speed;
    const radius = 6;

    const x = position[0] + Math.sin(t) * radius;
    const z = position[2] + Math.cos(t) * radius * 0.6;
    const y = position[1] + Math.sin(t * 1.6) * 0.6;

    const ahead = 0.05;
    scratch.set(
      position[0] + Math.sin(t + ahead) * radius,
      position[1] + Math.sin((t + ahead) * 1.6) * 0.6,
      position[2] + Math.cos(t + ahead) * radius * 0.6
    );

    group.position.set(x, y, z);
    group.lookAt(scratch);

    const beat = Math.sin(state.clock.elapsedTime * 2);
    flipperRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const front = i < 2;
      const left = i % 2 === 0;
      ref.rotation.z = beat * 0.5 * (front ? 1 : -0.6) * (left ? 1 : -1);
    });
  });

  const flippers = [
    { key: 'fl', position: [-0.85, 0, 0.35], rotation: [0, 0, 0.3] },
    { key: 'fr', position: [0.85, 0, 0.35], rotation: [0, 0, -0.3] },
    { key: 'bl', position: [-0.7, 0, -0.5], rotation: [0, 0, 0.2] },
    { key: 'br', position: [0.7, 0, -0.5], rotation: [0, 0, -0.2] },
  ];

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* shell */}
      <mesh scale={[1, 0.42, 1.25]}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshStandardMaterial color="#2c5c3d" roughness={0.75} metalness={0.15} />
      </mesh>

      {/* under-shell */}
      <mesh position={[0, -0.16, 0]} scale={[0.92, 0.2, 1.12]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#4a7c59" roughness={0.85} />
      </mesh>

      {/* head */}
      <mesh position={[0, 0.06, 1.24]} scale={[0.34, 0.3, 0.42]}>
        <sphereGeometry args={[1, 14, 12]} />
        <meshStandardMaterial color="#4a7c59" roughness={0.7} />
      </mesh>

      {flippers.map((flipper, i) => (
        <group
          key={flipper.key}
          ref={(el) => {
            flipperRefs.current[i] = el;
          }}
          position={flipper.position}
          rotation={flipper.rotation}
        >
          <mesh position={[0, 0, 0]} scale={[0.62, 0.07, 0.26]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#4a7c59" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

SwimmingTurtle.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  speed: PropTypes.number,
  scale: PropTypes.number,
  animate: PropTypes.bool,
};
