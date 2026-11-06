import { useMemo } from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { LAWNS, MAP_HALF, MAP_SIZE, WALKWAYS } from '../game/config';
import { makeBrickTexture, makeGrassTexture } from './env/textures';

const WALL_H = 8;

export function Plaza() {
  const brick = useMemo(() => makeBrickTexture(MAP_SIZE / 8), []);
  const grass = useMemo(() => makeGrassTexture(), []);
  const walkways = useMemo(
    () =>
      WALKWAYS.map((w) => {
        const dx = w.to[0] - w.from[0];
        const dz = w.to[1] - w.from[1];
        return {
          x: (w.from[0] + w.to[0]) / 2,
          z: (w.from[1] + w.to[1]) / 2,
          length: Math.hypot(dx, dz),
          width: w.width,
          rotY: Math.atan2(-dz, dx),
        };
      }),
    [],
  );

  return (
    <group>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[MAP_HALF, 0.5, MAP_HALF]} position={[0, -0.5, 0]} />
        {/* invisible boundary walls */}
        <CuboidCollider args={[MAP_HALF, WALL_H, 0.5]} position={[0, WALL_H, -MAP_HALF - 0.5]} />
        <CuboidCollider args={[MAP_HALF, WALL_H, 0.5]} position={[0, WALL_H, MAP_HALF + 0.5]} />
        <CuboidCollider args={[0.5, WALL_H, MAP_HALF]} position={[-MAP_HALF - 0.5, WALL_H, 0]} />
        <CuboidCollider args={[0.5, WALL_H, MAP_HALF]} position={[MAP_HALF + 0.5, WALL_H, 0]} />
      </RigidBody>

      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[MAP_SIZE, MAP_SIZE]} />
        <meshStandardMaterial map={brick} roughness={0.9} />
      </mesh>

      {walkways.map((w, i) => (
        <mesh key={i} position={[w.x, 0.02, w.z]} rotation={[-Math.PI / 2, 0, w.rotY]} receiveShadow>
          <planeGeometry args={[w.length, w.width]} />
          <meshStandardMaterial color="#e6c7b8" roughness={0.95} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
        </mesh>
      ))}

      {LAWNS.map((l, i) => (
        <group key={i} position={[l.x, 0, l.z]}>
          {/* curb */}
          <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
            <boxGeometry args={[l.w + 0.8, 0.12, l.d + 0.8]} />
            <meshStandardMaterial color="#d8cfc4" />
          </mesh>
          <mesh position={[0, 0.13, 0]} rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[l.w, l.d]} />
            <meshStandardMaterial map={grass} roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
