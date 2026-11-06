import { useMemo } from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { LAWNS, MAP_HALF, MAP_SIZE, WALKWAYS } from '../game/config';
import { makeBrickTexture, makeGrassTexture } from './env/textures';
import { lawnFootpaths } from './env/layout';

const WALL_H = 8;

function segmentTransform(from: [number, number], to: [number, number]) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  return { x: (from[0] + to[0]) / 2, z: (from[1] + to[1]) / 2, length: Math.hypot(dx, dz), rotY: Math.atan2(-dz, dx) };
}

export function Plaza() {
  const brick = useMemo(() => makeBrickTexture(MAP_SIZE / 8), []);
  const grass = useMemo(() => makeGrassTexture(), []);
  const walkways = useMemo(() => WALKWAYS.map((w) => ({ ...segmentTransform(w.from, w.to), width: w.width })), []);
  const footpaths = useMemo(() => lawnFootpaths(LAWNS).map((w) => ({ ...segmentTransform(w.from, w.to), width: w.width })), []);

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

      {/* grey stone walkway strips with darker borders */}
      {walkways.map((w, i) => (
        <group key={i} position={[w.x, 0, w.z]} rotation={[0, w.rotY, 0]}>
          <mesh position={[0, 0.015, 0]} rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[w.length, w.width + 0.6]} />
            <meshStandardMaterial color="#7f7f7c" roughness={0.95} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
          </mesh>
          <mesh position={[0, 0.02, 0]} rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[w.length, w.width]} />
            <meshStandardMaterial color="#cfcfca" roughness={0.95} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
          </mesh>
        </group>
      ))}

      {LAWNS.map((l, i) => (
        <group key={i} position={[l.x, 0, l.z]}>
          <mesh position={[0, 0.07, 0]} receiveShadow>
            <boxGeometry args={[l.w + 1.6, 0.14, l.d + 1.6]} />
            <meshStandardMaterial color="#2f6b35" />
          </mesh>
          <mesh position={[0, 0.15, 0]} rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[l.w, l.d]} />
            <meshStandardMaterial map={grass} roughness={1} />
          </mesh>
          {/* low hedges around the lawn */}
          {[
            [0, -l.d / 2 - 0.5, l.w + 1.6, 0.8],
            [0, l.d / 2 + 0.5, l.w + 1.6, 0.8],
            [-l.w / 2 - 0.5, 0, 0.8, l.d],
            [l.w / 2 + 0.5, 0, 0.8, l.d],
          ].map(([hx, hz, hw, hd], k) => (
            <mesh key={k} position={[hx, 0.45, hz]} castShadow receiveShadow>
              <boxGeometry args={[hw, 0.7, hd]} />
              <meshStandardMaterial color="#24552c" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}

      {/* thin white footpaths across the lawns */}
      {footpaths.map((w, i) => (
        <mesh key={i} position={[w.x, 0.17, w.z]} rotation={[-Math.PI / 2, 0, w.rotY]} receiveShadow>
          <planeGeometry args={[w.length, w.width]} />
          <meshStandardMaterial color="#efefe8" polygonOffset polygonOffsetFactor={-3} polygonOffsetUnits={-3} />
        </mesh>
      ))}
    </group>
  );
}
