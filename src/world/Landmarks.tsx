import { useMemo } from 'react';
import * as THREE from 'three';
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier';
import { ENDING_POINT, STAIR_CANOPY, WAVE_BENCH } from '../game/config';

function WaveBench() {
  const { x, z, w, d } = WAVE_BENCH;
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 60; i++) {
      const u = i / 60;
      pts.push(new THREE.Vector3((u - 0.5) * w, 0.9 + Math.sin(u * Math.PI * 4) * 0.55, 0));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.4, 10, false);
  }, [w]);
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color="#f2f2ee" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.2, d * 0.5]} />
        <meshStandardMaterial color="#c9a27a" />
      </mesh>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[w / 2, 0.6, d / 4]} position={[0, 0.6, 0]} />
      </RigidBody>
    </group>
  );
}

function StairCanopy() {
  const { x, z, w, d } = STAIR_CANOPY;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[w - 1, 0.08, d - 1]} />
        <meshStandardMaterial color="#2a2e33" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - 0.2), 1.3, 0]} castShadow>
          <boxGeometry args={[0.3, 2.6, d]} />
          <meshStandardMaterial color="#c8ccd0" metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 2.7, 0]} rotation-x={0.12} castShadow>
        <boxGeometry args={[w + 0.6, 0.18, d + 0.6]} />
        <meshStandardMaterial color="#7fb0d0" transparent opacity={0.75} metalness={0.3} roughness={0.2} />
      </mesh>
      <RigidBody type="fixed" colliders={false}>
        {[-1, 1].map((s) => (
          <CuboidCollider key={s} args={[0.15, 1.3, d / 2]} position={[s * (w / 2 - 0.2), 1.3, 0]} />
        ))}
      </RigidBody>
    </group>
  );
}

// The basin collider is small (radius 1.9) so the player can stand within ENDING_RADIUS (3 m) of the center.
function Fountain() {
  const [x, , z] = ENDING_POINT;
  const poly = { polygonOffset: true, polygonOffsetUnits: -2 } as const;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.03, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <ringGeometry args={[1.9, 3.4, 48]} />
        <meshStandardMaterial color="#f5d58a" emissive="#f5b84a" emissiveIntensity={0.25} polygonOffsetFactor={-2} {...poly} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[3.4, 3.7, 48]} />
        <meshStandardMaterial color="#ffffff" polygonOffsetFactor={-3} {...poly} />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 1.9, 0.6, 40]} />
        <meshStandardMaterial color="#e9e4dc" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.61, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1.62, 40]} />
        <meshStandardMaterial color="#5fc3e4" roughness={0.1} metalness={0.2} emissive="#2a8fb8" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.3, 1.8, 12]} />
        <meshStandardMaterial color="#e9e4dc" />
      </mesh>
      <mesh position={[0, 2.35, 0]}>
        <coneGeometry args={[0.45, 1.0, 16, 1, true]} />
        <meshStandardMaterial color="#bfeaff" transparent opacity={0.55} emissive="#8fd8ff" emissiveIntensity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 3.0, 0]}>
        <octahedronGeometry args={[0.28]} />
        <meshStandardMaterial color="#ffd54a" emissive="#ffb300" emissiveIntensity={0.8} />
      </mesh>
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[0.5, 1.9]} position={[0, 0.5, 0]} />
      </RigidBody>
    </group>
  );
}

export function Landmarks() {
  return (
    <group>
      <WaveBench />
      <StairCanopy />
      <Fountain />
    </group>
  );
}
