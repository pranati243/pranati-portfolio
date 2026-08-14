import { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending } from 'three';
import { COLOR_PALETTE, PARTICLE_CONFIG, UPDATE_INTERVALS } from './config.js';

/**
 * Marine snow / plankton drift — one THREE.Points object for the whole field.
 * Additive blending is what makes overlapping motes glow instead of flatten,
 * and is the bulk of the "sparkling water" read.
 */
export default function ParticleSystem({ count = 1500, animate = true }) {
  const pointsRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const { bounds, animation } = PARTICLE_CONFIG;

  const { positions, velocities, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const ph = new Float32Array(count);

    const span = (range) => range[0] + Math.random() * (range[1] - range[0]);

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      pos[i3] = span(bounds.x);
      pos[i3 + 1] = span(bounds.y);
      pos[i3 + 2] = span(bounds.z);

      vel[i3] = (Math.random() - 0.5) * 1;
      vel[i3 + 1] = 0.5 + Math.random(); // biased upward
      vel[i3 + 2] = (Math.random() - 0.5) * 1;

      // Random phase keeps the field from bobbing in unison.
      ph[i] = Math.random() * Math.PI * 2;
    }

    return { positions: pos, velocities: vel, phases: ph };
  }, [count, bounds.x, bounds.y, bounds.z]);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    // Cheap: the whole field turns every frame so it never looks frozen.
    if (animate) points.rotation.y += animation.rotationSpeed * delta;

    if (!animate) return;

    const elapsedMs = state.clock.elapsedTime * 1000;
    if (elapsedMs - lastUpdateRef.current < UPDATE_INTERVALS.particles) return;
    lastUpdateRef.current = elapsedMs;

    const time = state.clock.elapsedTime;
    const attr = points.geometry.attributes.position;
    const array = attr.array;
    const step = delta * 60;

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;

      array[i3 + 1] += animation.verticalSpeed * velocities[i3 + 1] * step;

      const swayX = Math.sin(time * animation.horizontalSpeed + phases[i]);
      const swayZ = Math.cos(time * animation.horizontalSpeed + phases[i]);
      array[i3] += swayX * animation.swayAmplitude * step * 0.01;
      array[i3 + 2] += swayZ * animation.swayAmplitude * step * 0.01;

      // Wrap vertically, bounce horizontally.
      if (array[i3 + 1] > bounds.y[1]) array[i3 + 1] = bounds.y[0];
      if (array[i3] < bounds.x[0] || array[i3] > bounds.x[1]) velocities[i3] *= -1;
      if (array[i3 + 2] < bounds.z[0] || array[i3 + 2] > bounds.z[1]) velocities[i3 + 2] *= -1;
    }

    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color={COLOR_PALETTE.particles}
        transparent
        opacity={0.6}
        blending={AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

ParticleSystem.propTypes = {
  count: PropTypes.number,
  animate: PropTypes.bool,
};
