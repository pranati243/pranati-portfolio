import { COLOR_PALETTE } from './config.js';

/**
 * Two key lights plus two cool fills. Nothing casts shadows — shadow maps are
 * the single most expensive thing in a scene this size and buy almost nothing
 * underwater, where light is diffuse anyway.
 */
export default function Lighting() {
  return (
    <>
      <ambientLight color={COLOR_PALETTE.ambient} intensity={0.55} />
      <directionalLight
        color={COLOR_PALETTE.sunRays}
        intensity={1.05}
        position={[10, 22, 8]}
        castShadow={false}
      />
      <pointLight color="#66d9ff" intensity={28} distance={45} position={[-8, 6, -6]} />
      <pointLight color="#88eeff" intensity={16} distance={40} position={[9, -2, -8]} />
    </>
  );
}
