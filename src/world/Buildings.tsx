import { useMemo } from 'react';
import * as THREE from 'three';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { BUILDINGS, type BuildingDef } from '../game/config';
import { makeNumberTexture, makeWindowTexture } from './env/textures';

function Building({ def }: { def: BuildingDef }) {
  const isGlass = def.id === 'library';
  const materials = useMemo(() => {
    const rows = Math.max(2, Math.round(def.height / 3.6));
    const wall = isGlass ? '#9dc3df' : def.color;
    const glass = isGlass ? '#cfe8f7' : '#9fc4dc';
    const frame = isGlass ? 'rgba(40,70,100,0.5)' : undefined;
    const front = makeWindowTexture({ wall, glass, rows, cols: Math.max(2, Math.round(def.w / 3.2)), frame });
    const side = makeWindowTexture({ wall, glass, rows, cols: Math.max(2, Math.round(def.d / 3.2)), frame });
    const roof = new THREE.MeshStandardMaterial({ color: '#7d8186' });
    const mk = (map: THREE.Texture) =>
      new THREE.MeshStandardMaterial({ map, roughness: isGlass ? 0.15 : 0.85, metalness: isGlass ? 0.5 : 0 });
    // box face order: +x, -x, +y, -y, +z (plaza side), -z
    return [mk(side), mk(side), roof, roof, mk(front), mk(front)];
  }, [def, isGlass]);

  const sign = useMemo(() => (def.id === 'b12' ? makeNumberTexture('12') : null), [def.id]);

  return (
    <group position={[def.x, 0, def.z]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[def.w / 2, def.height / 2, def.d / 2]} position={[0, def.height / 2, 0]} />
      </RigidBody>
      <mesh position={[0, def.height / 2, 0]} material={materials} castShadow receiveShadow>
        <boxGeometry args={[def.w, def.height, def.d]} />
      </mesh>
      {/* roof parapet */}
      <mesh position={[0, def.height + 0.3, 0]} castShadow>
        <boxGeometry args={[def.w + 0.6, 0.6, def.d + 0.6]} />
        <meshStandardMaterial color={isGlass ? '#5b7388' : '#8a8e93'} />
      </mesh>
      {/* entrance canopy */}
      <mesh position={[0, 3.4, def.d / 2 + 1.2]} castShadow>
        <boxGeometry args={[Math.min(10, def.w * 0.4), 0.3, 2.4]} />
        <meshStandardMaterial color="#555b61" />
      </mesh>
      {sign && (
        <mesh position={[def.w * 0.18, def.height * 0.66, def.d / 2 + 0.06]}>
          <planeGeometry args={[9, 9]} />
          <meshBasicMaterial map={sign} transparent toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

export function Buildings() {
  return (
    <group>
      {BUILDINGS.map((b) => (
        <Building key={b.id} def={b} />
      ))}
    </group>
  );
}
