import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';

/**
 * 2D canvas ocean — the no-GPU tier. Layered light shafts, rising motes and
 * three sine waves, all drawn by hand at ~60fps with no WebGL involved.
 */
export default function CanvasOceanBackground() {
  const canvasRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    let frame = null;
    let time = 0;

    const state = { width: 0, height: 0, particles: [], waves: [], rays: [] };

    const seed = () => {
      const { width, height } = state;

      state.waves = [
        { amplitude: 32, frequency: 0.002, speed: 0.0005, offset: 0, y: height * 0.68, alpha: 0.16 },
        {
          amplitude: 26,
          frequency: 0.0025,
          speed: 0.0007,
          offset: Math.PI / 2,
          y: height * 0.76,
          alpha: 0.2,
        },
        { amplitude: 20, frequency: 0.003, speed: 0.0009, offset: Math.PI, y: height * 0.84, alpha: 0.26 },
      ];

      state.particles = Array.from({ length: 56 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1 + Math.random() * 3,
        speedY: 0.2 + Math.random() * 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: 0.2 + Math.random() * 0.5,
      }));

      state.rays = Array.from({ length: 5 }, (_, i) => ({
        x: (width / 6) * (i + 1),
        width: 80 + Math.random() * 60,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.004 + Math.random() * 0.004,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      state.width = window.innerWidth;
      state.height = window.innerHeight;
      canvas.width = state.width * dpr;
      canvas.height = state.height * dpr;
      canvas.style.width = `${state.width}px`;
      canvas.style.height = `${state.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = () => {
      const { width, height } = state;

      const base = ctx.createLinearGradient(0, 0, 0, height);
      base.addColorStop(0, 'rgba(56,189,248,0.22)');
      base.addColorStop(0.5, 'rgba(59,130,246,0.3)');
      base.addColorStop(1, 'rgba(10,37,64,0.55)');
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      // Light shafts
      state.rays.forEach((ray) => {
        ray.sway += ray.swaySpeed;
        const swayOffset = Math.sin(ray.sway) * 30;
        const gradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
        gradient.addColorStop(0, 'rgba(180,235,255,0.14)');
        gradient.addColorStop(1, 'rgba(180,235,255,0)');
        ctx.fillStyle = gradient;
        ctx.save();
        ctx.translate(ray.x + swayOffset, 0);
        ctx.rotate(0.06);
        ctx.fillRect(-ray.width / 2, 0, ray.width, height * 0.6);
        ctx.restore();
      });

      // Rising motes, each a soft glow rather than a hard dot
      state.particles.forEach((particle) => {
        particle.y -= particle.speedY;
        particle.x += particle.speedX;

        if (particle.y < -10) particle.y = height + 10;
        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;

        const glow = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius * 6
        );
        glow.addColorStop(0, `rgba(255,255,255,${particle.opacity})`);
        glow.addColorStop(0.4, `rgba(224,247,255,${particle.opacity * 0.5})`);
        glow.addColorStop(1, 'rgba(224,247,255,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 6, 0, Math.PI * 2);
        ctx.fill();
      });

      // Waves
      state.waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 5) {
          const y =
            wave.y + Math.sin(x * wave.frequency + time * wave.speed + wave.offset) * wave.amplitude;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        const fill = ctx.createLinearGradient(0, wave.y - wave.amplitude, 0, height);
        fill.addColorStop(0, `rgba(59,130,246,${wave.alpha})`);
        fill.addColorStop(0.5, `rgba(56,189,248,${wave.alpha * 1.3})`);
        fill.addColorStop(1, `rgba(10,37,64,${wave.alpha * 1.6})`);
        ctx.fillStyle = fill;
        ctx.fill();

        ctx.strokeStyle = `rgba(56,189,248,${wave.alpha + 0.12})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };

    const animate = () => {
      time += 1;
      draw();
      frame = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);

    if (reducedMotion) {
      draw();
    } else {
      frame = requestAnimationFrame(animate);
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion]);

  return (
    <canvas ref={canvasRef} className="ocean-canvas__2d" aria-hidden="true" role="presentation" />
  );
}
