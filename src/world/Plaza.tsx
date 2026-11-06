import { useMemo } from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { LAWNS, MAP_HALF, MAP_SIZE, WALKWAYS } from '../game/config';
import { GroundSurface } from './env/GroundSurface';
import { BorderPlanting } from './env/BorderPlanting';
import { lawnFootpaths } from './env/layout';

const WALL_H = 8;

function segmentTransform(from: [number, number], to: [number, number]) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  return { x: (from[0] + to[0]) / 2, z: (from[1] + to[1]) / 2, length: Math.hypot(dx, dz), rotY: Math.atan2(-dz, dx) };
}

export function Plaza() {
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

      <group rotation-x={-Math.PI / 2}>
        <GroundSurface width={MAP_SIZE} depth={MAP_SIZE} surface="clay" />
      </group>

      {/* grey stone walkway strips with darker borders */}
      {walkways.map((w, i) => (
        <group key={i} position={[w.x, 0, w.z]} rotation={[0, w.rotY, 0]}>
          <mesh position={[0, 0.015, 0]} rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[w.length, w.width + 0.6]} />
            <meshStandardMaterial color="#7f7f7c" roughness={0.95} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
          </mesh>
          <group position={[0, 0.02, 0]} rotation-x={-Math.PI / 2}>
            <GroundSurface width={w.length} depth={w.width} surface="granite" offset={-2} />
          </group>
        </group>
      ))}

      {LAWNS.map((l, i) => (
        <group key={i} position={[l.x, 0, l.z]}>
          <mesh position={[0, 0.07, 0]} receiveShadow>
            <boxGeometry args={[l.w + 1.6, 0.14, l.d + 1.6]} />
            <meshStandardMaterial color="#796d56" />
          </mesh>
          <group position={[0, 0.15, 0]} rotation-x={-Math.PI / 2}>
            <GroundSurface width={l.w} depth={l.d} surface="lawn" />
          </group>
          <BorderPlanting width={l.w} depth={l.d} />
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
