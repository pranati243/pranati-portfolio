import { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, CanvasTexture, RepeatWrapping } from 'three';
import { COLOR_PALETTE, UPDATE_INTERVALS } from './config.js';

/**
 * Rippling light on the seabed. Not a real caustics shader — a procedurally
 * drawn canvas texture whose UVs are scrolled and rotated, which costs
 * essentially nothing and reads correctly at this distance.
 */
function generateCausticsTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, size, size);

  for (let i = 0; i < 22; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 22 + Math.random() * 68;
    const alpha = 0.2 + Math.random() * 0.3;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i += 1) {
    ctx.beginPath();
    let x = Math.random() * size;
    let y = Math.random() * size;
    ctx.moveTo(x, y);
    for (let step = 0; step < 5; step += 1) {
      x += (Math.random() - 0.5) * 120;
      y += (Math.random() - 0.5) * 120;
      ctx.quadraticCurveTo(x + 20, y - 20, x, y);
    }
    ctx.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

export default function CausticsEffect({ intensity = 0.4, resolution = 512, animate = true }) {
  const materialRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const texture = useMemo(() => generateCausticsTexture(resolution), [resolution]);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state) => {
    if (!animate) return;

    const elapsedMs = state.clock.elapsedTime * 1000;
    if (elapsedMs - lastUpdateRef.current < UPDATE_INTERVALS.caustics) return;
    lastUpdateRef.current = elapsedMs;

    const t = state.clock.elapsedTime;
    texture.offset.x = Math.sin(t * 0.05) * 0.1;
    texture.offset.y = t * 0.025;
    texture.rotation = Math.sin(t * 0.02) * 0.1;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -9.6, -10]}>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial
        ref={materialRef}
        map={texture}
        color={COLOR_PALETTE.caustics}
        transparent
        opacity={intensity}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

CausticsEffect.propTypes = {
  intensity: PropTypes.number,
  resolution: PropTypes.number,
  animate: PropTypes.bool,
};
