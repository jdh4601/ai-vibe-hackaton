import { FacadeDetails } from './env/FacadeDetails';
import { useMemo } from 'react';
import * as THREE from 'three';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { BUILDINGS, type BuildingDef } from '../game/config';
import { makeNumberTexture, makeWindowTexture, type FacadeOptions } from './env/textures';

function facadeStyle(def: BuildingDef, cols: number, rows: number): FacadeOptions {
  switch (def.id) {
    case 'b12': // light grey with a dark glass strip tower on one side
      return { wall: '#c4c8ca', glass: '#8fb0c4', cols, rows, winW: 0.78, winH: 0.5, darkRight: 0.22 };
    case 'library': // greenish glass with horizontal louvers
      return { wall: '#859491', glass: '#849e9d', cols: Math.max(2, cols - 2), rows, winW: 0.92, winH: 0.7, frame: 'rgba(30,60,60,0.5)', louvers: true };
    default: // beige stone with regular punched windows
      return { wall: def.color, glass: '#7f9cb0', cols, rows, winW: 0.66, winH: 0.55 };
  }
}

function Building({ def }: { def: BuildingDef }) {
  const isGlass = def.id === 'library';
  const materials = useMemo(() => {
    const rows = Math.max(2, Math.round(def.height / 3.4));
    const front = makeWindowTexture(facadeStyle(def, Math.max(2, Math.round(def.w / 3)), rows));
    const side = makeWindowTexture(facadeStyle({ ...def, id: def.id === 'b12' ? 'stone' : def.id }, Math.max(2, Math.round(def.d / 3)), rows));
    const roof = new THREE.MeshStandardMaterial({ color: '#8d9094' });
    const mk = (map: THREE.Texture) => new THREE.MeshStandardMaterial({ map, roughness: isGlass ? 0.25 : 0.85, metalness: isGlass ? 0.35 : 0 });
    // box face order: +x, -x, +y, -y, +z (plaza side), -z
    return [mk(side), mk(side), roof, roof, mk(front), mk(front)];
  }, [def, isGlass]);

  const sign = useMemo(() => (def.id === 'b12' ? makeNumberTexture('12') : null), [def.id]);
  const h = def.height;

  return (
    <group position={[def.x, 0, def.z]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[def.w / 2, h / 2, def.d / 2]} position={[0, h / 2, 0]} />
      </RigidBody>
      <mesh position={[0, h / 2, 0]} material={materials} castShadow receiveShadow>
        <boxGeometry args={[def.w, h, def.d]} />
      </mesh>
      <mesh position={[0, h + 0.25, 0]} castShadow>
        <boxGeometry args={[def.w + 0.5, 0.5, def.d + 0.5]} />
        <meshStandardMaterial color={isGlass ? '#4f6670' : '#7b7f84'} />
      </mesh>
      <FacadeDetails def={def} />
      {/* entrance canopy */}
      <mesh position={[0, 3.4, def.d / 2 + 1.2]} castShadow>
        <boxGeometry args={[Math.min(10, def.w * 0.4), 0.3, 2.4]} />
        <meshStandardMaterial color="#555b61" />
      </mesh>
      {def.id === 'b12' && (
        <>
          {/* rooftop equipment */}
          <mesh position={[-def.w * 0.25, h + 1.4, 0]} castShadow>
            <boxGeometry args={[6, 2, 4]} />
            <meshStandardMaterial color="#6d7177" />
          </mesh>
          <mesh position={[def.w * 0.3, h + 1.1, -1]} castShadow>
            <boxGeometry args={[3, 1.4, 3]} />
            <meshStandardMaterial color="#8a8e92" />
          </mesh>
          <mesh position={[def.w * 0.3, h + 2.6, -1]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 2, 8]} />
            <meshStandardMaterial color="#9a9ea2" />
          </mesh>
        </>
      )}
      {isGlass && (
        <mesh position={[def.w * 0.1, h + 1.6, 0]} rotation-y={Math.PI / 4}>
          <coneGeometry args={[4.2, 2.4, 4]} />
          <meshStandardMaterial color="#b9ddd9" transparent opacity={0.75} metalness={0.3} roughness={0.2} />
        </mesh>
      )}
      {sign && (
        <mesh position={[def.w * 0.4, h * 0.84, def.d / 2 + 0.06]}>
          <planeGeometry args={[4.6, 4.6]} />
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
