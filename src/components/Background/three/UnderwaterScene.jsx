import PropTypes from 'prop-types';
import Lighting from './Lighting.jsx';
import OceanFloor from './OceanFloor.jsx';
import ParticleSystem from './ParticleSystem.jsx';
import CausticsEffect from './CausticsEffect.jsx';
import InteractiveCamera from './InteractiveCamera.jsx';
import SwimmingFish from './SwimmingFish.jsx';
import FloatingJellyfish from './FloatingJellyfish.jsx';
import CoralReef from './CoralReef.jsx';
import SwimmingTurtle from './SwimmingTurtle.jsx';
import LightRays from './LightRays.jsx';
import Kelp from './Kelp.jsx';
import { COLOR_PALETTE, FOG_CONFIG } from './config.js';

/**
 * Creature placement is hand-authored rather than random so the composition
 * stays balanced: nothing sits dead-centre behind the hero copy, and the
 * silhouettes spread to both edges of a wide viewport.
 */
const FISH = [
  { position: [-5, 0.2, -5], speed: 0.8, color: '#38BDF8', scale: 1 },
  { position: [-3.4, 1.4, -6.5], speed: 0.95, color: '#60A5FA', scale: 0.8 },
  { position: [-6.2, -1.2, -4.5], speed: 0.7, color: '#38BDF8', scale: 0.9 },
  { position: [5.2, 1.2, -5.5], speed: 1.1, color: '#14B8A6', scale: 1.05 },
  { position: [6.4, -0.4, -6.5], speed: 1, color: '#0EA5E9', scale: 0.85 },
  { position: [0.5, -2.2, -8], speed: 0.9, color: '#60A5FA', scale: 1.1 },
  { position: [-1.5, 2.4, -7.5], speed: 0.85, color: '#38BDF8', scale: 0.75 },
  { position: [3, -3, -9], speed: 0.75, color: '#14B8A6', scale: 0.95 },
];

const JELLYFISH = [
  { position: [-5.5, 2.4, -4], speed: 0.5, scale: 1 },
  { position: [5, 3, -5], speed: 0.6, scale: 0.85 },
  { position: [0, 3.6, -8], speed: 0.4, scale: 1.15 },
  { position: [-2.5, 1.6, -6], speed: 0.55, scale: 0.7 },
  { position: [2.8, 3.2, -6.5], speed: 0.45, scale: 0.9 },
  { position: [-6.5, 2.8, -7], speed: 0.5, scale: 1.05 },
  { position: [6.5, 1.8, -7.5], speed: 0.6, scale: 0.8 },
];

/**
 * Pushed well back (z -11 to -19) so the reef sits deep in the fog as scenery
 * rather than sprouting up through the hero's buttons and stat cards, which is
 * where it landed at the original z -6 to -12.
 */
const CORALS = [
  { position: [-5.5, -9.4, -11], scale: 1.15 },
  { position: [4.5, -9.4, -12], scale: 1 },
  { position: [0, -9.4, -14], scale: 1.35 },
  { position: [-8.5, -9.4, -13.5], scale: 1.1 },
  { position: [7.5, -9.4, -13], scale: 1.25 },
  { position: [-2.5, -9.4, -16], scale: 0.95 },
  { position: [3, -9.4, -18], scale: 1.15 },
];

const KELP = [
  { position: [-9, -9.6, -12], height: 8 },
  { position: [-6, -9.6, -14], height: 6.5 },
  { position: [8.5, -9.6, -13], height: 7.5 },
  { position: [5.5, -9.6, -15], height: 6 },
];

export default function UnderwaterScene({ config }) {
  const {
    particleCount = 1500,
    enableCaustics = true,
    enableAnimations = true,
    enableCreatures = true,
    textureResolution = 512,
  } = config;

  return (
    <>
      <color attach="background" args={[COLOR_PALETTE.deepWater]} />
      <fog attach="fog" args={[FOG_CONFIG.color, FOG_CONFIG.near, FOG_CONFIG.far]} />

      <InteractiveCamera animate={enableAnimations} />
      <Lighting />

      <LightRays count={enableCreatures ? 6 : 4} animate={enableAnimations} />
      <OceanFloor animate={enableAnimations} />

      {enableCaustics && (
        <CausticsEffect
          intensity={0.42}
          resolution={textureResolution}
          animate={enableAnimations}
        />
      )}

      <ParticleSystem count={particleCount} animate={enableAnimations} />

      {enableCreatures && (
        <>
          {FISH.map((fish) => (
            <SwimmingFish key={fish.position.join()} {...fish} animate={enableAnimations} />
          ))}
          {JELLYFISH.map((jelly) => (
            <FloatingJellyfish
              key={jelly.position.join()}
              {...jelly}
              animate={enableAnimations}
            />
          ))}
          {CORALS.map((coral) => (
            <CoralReef key={coral.position.join()} {...coral} animate={enableAnimations} />
          ))}
          {KELP.map((kelp) => (
            <Kelp key={kelp.position.join()} {...kelp} animate={enableAnimations} />
          ))}
          <SwimmingTurtle position={[0, -1, -14]} scale={1.2} animate={enableAnimations} />
        </>
      )}
    </>
  );
}

UnderwaterScene.propTypes = {
  config: PropTypes.object.isRequired,
};
