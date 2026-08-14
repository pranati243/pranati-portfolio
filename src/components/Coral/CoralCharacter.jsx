import { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, MathUtils } from 'three';

const TENTACLE_COUNT = 7;
const CORAL_BRANCH_COLORS = ['#ff6b9d', '#ffa07a', '#ffb6c1'];

/**
 * Coral herself, as an actual character rather than an icon.
 *
 * `mood` drives everything: idle breathing, a leaning-in listen pose, an
 * agitated glow while thinking, and a jaw + head bounce while speaking.
 * `gaze` is a live ref (not state) holding the pointer in -1..1 screen space,
 * so she can follow the cursor without re-rendering on every mouse move.
 */
export default function CoralCharacter({ mood = 'idle', gaze }) {
  const rootRef = useRef(null);
  const headRef = useRef(null);
  const bellRef = useRef(null);
  const jawRef = useRef(null);
  const eyesRef = useRef(null);
  const pupilRefs = useRef([]);
  const tentacleRefs = useRef([]);
  const glowRef = useRef(null);
  const motesRef = useRef(null);

  const nextBlinkRef = useRef(2.5);
  const blinkUntilRef = useRef(0);
  // Smoothed values so mood changes ease in instead of snapping.
  const smooth = useRef({ lean: 0, glow: 0.6, speak: 0 });

  const tentacles = useMemo(
    () =>
      Array.from({ length: TENTACLE_COUNT }, (_, i) => {
        const angle = (i / TENTACLE_COUNT) * Math.PI * 2;
        return {
          key: i,
          x: Math.cos(angle) * 0.62,
          z: Math.sin(angle) * 0.62,
          length: 1.05 + (i % 3) * 0.24,
          phase: i * 0.7,
        };
      }),
    []
  );

  const branches = useMemo(
    () =>
      CORAL_BRANCH_COLORS.map((color, i) => ({
        color,
        angle: (i - 1) * 0.55,
        height: 0.62 + (i === 1 ? 0.22 : 0),
        offsetX: (i - 1) * 0.34,
      })),
    []
  );

  const motePositions = useMemo(() => {
    const count = 26;
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 1.1;
      array[i * 3] = Math.cos(angle) * radius;
      array[i * 3 + 1] = (Math.random() - 0.5) * 2.6;
      array[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return array;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const step = Math.min(delta, 0.05);

    const thinking = mood === 'thinking';
    const speaking = mood === 'speaking';

    // --- ease the mood targets -------------------------------------------
    const s = smooth.current;
    s.lean = MathUtils.damp(s.lean, speaking ? 0.22 : thinking ? -0.12 : 0, 4, step);
    s.glow = MathUtils.damp(s.glow, thinking ? 1.5 : speaking ? 1.05 : 0.6, 5, step);
    s.speak = MathUtils.damp(s.speak, speaking ? 1 : 0, 9, step);

    // --- whole-body float --------------------------------------------------
    if (rootRef.current) {
      const bobSpeed = thinking ? 1.9 : 1;
      rootRef.current.position.y = Math.sin(t * bobSpeed) * 0.09 - 0.1;
      rootRef.current.rotation.z = Math.sin(t * 0.55) * 0.045;
    }

    // --- head: follow the pointer, lean with the mood ----------------------
    if (headRef.current) {
      const target = gaze?.current || { x: 0, y: 0 };
      const yaw = MathUtils.clamp(target.x, -1, 1) * 0.42;
      const pitch = MathUtils.clamp(target.y, -1, 1) * 0.26;

      headRef.current.rotation.y = MathUtils.damp(headRef.current.rotation.y, yaw, 4, step);
      headRef.current.rotation.x = MathUtils.damp(
        headRef.current.rotation.x,
        pitch + s.lean * 0.5,
        4,
        step
      );

      // A small bounce on each syllable while she talks.
      const bounce = s.speak * Math.sin(t * 13) * 0.035;
      headRef.current.position.y = 0.12 + bounce;
      headRef.current.position.z = s.lean;
    }

    // --- bell breathing / pulsing -----------------------------------------
    if (bellRef.current) {
      const rate = thinking ? 3.4 : 1.5;
      const depth = thinking ? 0.055 : 0.032;
      const pulse = 1 + Math.sin(t * rate) * depth;
      bellRef.current.scale.set(pulse, 1 / pulse, pulse);
      bellRef.current.material.emissiveIntensity = s.glow;
    }

    if (glowRef.current) {
      glowRef.current.material.opacity = 0.14 + s.glow * 0.12 + Math.sin(t * 2.2) * 0.02;
    }

    // --- jaw: open and close on the speech rhythm --------------------------
    if (jawRef.current) {
      // Two detuned sines read as speech; one alone sounds like a metronome.
      const rhythm = (Math.sin(t * 15) * 0.6 + Math.sin(t * 9.3) * 0.4 + 1) / 2;
      const openness = 0.12 + s.speak * rhythm * 0.9;
      jawRef.current.scale.y = openness;
      jawRef.current.position.y = -0.34 - openness * 0.06;
    }

    // --- blinking ----------------------------------------------------------
    if (eyesRef.current) {
      if (t > nextBlinkRef.current) {
        blinkUntilRef.current = t + 0.13;
        nextBlinkRef.current = t + 2.4 + Math.random() * 3.4;
      }
      eyesRef.current.scale.y = t < blinkUntilRef.current ? 0.08 : 1;
    }

    // --- pupils drift toward the pointer inside the eye ---------------------
    const target = gaze?.current || { x: 0, y: 0 };
    pupilRefs.current.forEach((pupil) => {
      if (!pupil) return;
      pupil.position.x = MathUtils.damp(
        pupil.position.x,
        MathUtils.clamp(target.x, -1, 1) * 0.07,
        6,
        step
      );
      pupil.position.y = MathUtils.damp(
        pupil.position.y,
        MathUtils.clamp(target.y, -1, 1) * 0.05,
        6,
        step
      );
    });

    // --- tentacles ---------------------------------------------------------
    tentacleRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const speed = thinking ? 3.4 : 1.7;
      const amp = thinking ? 0.3 : 0.18;
      ref.rotation.z = Math.sin(t * speed + tentacles[i].phase) * amp;
      ref.rotation.x = Math.cos(t * speed * 0.7 + tentacles[i].phase) * amp * 0.6;
    });

    // --- orbiting motes ----------------------------------------------------
    if (motesRef.current) {
      motesRef.current.rotation.y += (thinking ? 0.9 : 0.22) * step;
      motesRef.current.rotation.x = Math.sin(t * 0.3) * 0.12;
    }
  });

  return (
    <group ref={rootRef} scale={0.92}>
      {/* soft halo behind her */}
      <mesh ref={glowRef} position={[0, 0.1, -1.2]}>
        <circleGeometry args={[2.3, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.2}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <group ref={headRef} position={[0, 0.12, 0]}>
        {/* translucent bell */}
        <mesh ref={bellRef}>
          <sphereGeometry args={[1, 40, 32]} />
          <meshStandardMaterial
            color="#7fd8ff"
            emissive="#38bdf8"
            emissiveIntensity={0.6}
            transparent
            opacity={0.62}
            roughness={0.12}
            metalness={0.05}
          />
        </mesh>

        {/* inner core, visible through the bell */}
        <mesh scale={0.72}>
          <sphereGeometry args={[1, 24, 18]} />
          <meshBasicMaterial color="#0d4d7a" transparent opacity={0.42} depthWrite={false} />
        </mesh>

        {/* coral branches — the reason she's called Coral */}
        {branches.map((branch) => (
          <group
            key={branch.color}
            position={[branch.offsetX, 0.86, -0.05]}
            rotation={[0, 0, branch.angle]}
          >
            <mesh position={[0, branch.height / 2, 0]}>
              <cylinderGeometry args={[0.07, 0.13, branch.height, 8]} />
              <meshStandardMaterial
                color={branch.color}
                emissive={branch.color}
                emissiveIntensity={0.42}
                roughness={0.55}
              />
            </mesh>
            <mesh position={[0.1, branch.height * 0.78, 0]} rotation={[0, 0, -0.7]}>
              <cylinderGeometry args={[0.04, 0.07, branch.height * 0.5, 6]} />
              <meshStandardMaterial
                color={branch.color}
                emissive={branch.color}
                emissiveIntensity={0.42}
                roughness={0.55}
              />
            </mesh>
            <mesh position={[0, branch.height + 0.05, 0]}>
              <sphereGeometry args={[0.075, 10, 10]} />
              <meshStandardMaterial color="#e6faff" emissive="#38bdf8" emissiveIntensity={1.6} />
            </mesh>
          </group>
        ))}

        {/* eyes */}
        <group ref={eyesRef} position={[0, 0.06, 0.82]}>
          {[-0.3, 0.3].map((x, i) => (
            <group key={x} position={[x, 0, 0]}>
              <mesh scale={[1, 1.12, 0.55]}>
                <sphereGeometry args={[0.235, 20, 18]} />
                <meshStandardMaterial color="#ffffff" roughness={0.25} />
              </mesh>
              <mesh
                ref={(el) => {
                  pupilRefs.current[i] = el;
                }}
                position={[0, 0, 0.14]}
              >
                <sphereGeometry args={[0.108, 14, 14]} />
                <meshStandardMaterial color="#07243d" roughness={0.2} />
              </mesh>
              <mesh position={[x > 0 ? 0.05 : 0.05, 0.07, 0.22]}>
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}
        </group>

        {/* mouth — scales open on the speech rhythm */}
        <group ref={jawRef} position={[0, -0.34, 0.78]} scale={[1, 0.12, 1]}>
          <mesh>
            <sphereGeometry args={[0.2, 18, 14]} />
            <meshStandardMaterial
              color="#0a2c4a"
              emissive="#0d3a5f"
              emissiveIntensity={0.5}
              roughness={0.4}
            />
          </mesh>
        </group>

        {/* blush polyps */}
        {[-0.62, 0.62].map((x) => (
          <mesh key={x} position={[x, -0.22, 0.62]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial
              color="#ff8fb3"
              emissive="#ff6b9d"
              emissiveIntensity={0.55}
              transparent
              opacity={0.55}
            />
          </mesh>
        ))}
      </group>

      {/* tentacles */}
      {tentacles.map((tentacle, i) => (
        <group
          key={tentacle.key}
          ref={(el) => {
            tentacleRefs.current[i] = el;
          }}
          position={[tentacle.x, -0.72, tentacle.z]}
        >
          <mesh position={[0, -tentacle.length / 2, 0]}>
            <cylinderGeometry args={[0.055, 0.012, tentacle.length, 7]} />
            <meshStandardMaterial
              color="#5ad2ff"
              emissive="#38bdf8"
              emissiveIntensity={0.5}
              transparent
              opacity={0.6}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}

      {/* motes orbiting her, like plankton caught in the glow */}
      <points ref={motesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[motePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.075}
          color="#d8f6ff"
          transparent
          opacity={0.75}
          blending={AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

CoralCharacter.propTypes = {
  mood: PropTypes.oneOf(['idle', 'thinking', 'speaking']),
  gaze: PropTypes.shape({ current: PropTypes.object }),
};
