import { useMemo } from 'react';
import * as THREE from 'three';
import { Instance, Instances } from '@react-three/drei';
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ENDING_POINT, STAIR_CANOPY, WAVE_BENCH } from '../game/config';

// Stainless twisted ribbon bench: a flattened tube that undulates and twists.
function WaveBench() {
  const { x, z, w, d } = WAVE_BENCH;
  const geo = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 2; k++) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 80; i++) {
        const u = i / 80;
        pts.push(new THREE.Vector3((u - 0.5) * w, 0.75 + Math.sin(u * Math.PI * 5 + k * 1.6) * 0.5, Math.sin(u * Math.PI * 3 + k) * 0.35 * (k ? 1 : -1)));
      }
      const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, 0.28, 3, false);
      g.scale(1, 0.55, 1.6); // flatten into a ribbon
      parts.push(g.toNonIndexed());
    }
    return mergeGeometries(parts);
  }, [w]);
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color="#e4e9ee" metalness={0.55} roughness={0.25} flatShading />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.9, 0.12, d * 0.4]} />
        <meshStandardMaterial color="#9aa1a8" metalness={0.5} roughness={0.4} />
      </mesh>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[w / 2, 0.6, d / 4]} position={[0, 0.6, 0]} />
      </RigidBody>
    </group>
  );
}

// Light steel frame with a flat dark solar-panel roof over a descending stair.
function StairCanopy() {
  const { x, z, w, d } = STAIR_CANOPY;
  const steps = [0, 1, 2, 3, 4, 5];
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[w - 1, 0.08, d - 1]} />
        <meshStandardMaterial color="#1f2328" />
      </mesh>
      {/* stairs descending toward -z (north) */}
      {steps.map((s) => (
        <mesh key={s} position={[0, 0.1 + 0.02 * s, d / 2 - 1 - s * 0.7]} receiveShadow>
          <boxGeometry args={[w - 2, 0.12, 0.62]} />
          <meshStandardMaterial color={s % 2 ? '#c8c8c2' : '#aeaea8'} />
        </mesh>
      ))}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (w / 2 - 0.15), 1.3, sz * (d / 2 - 0.15)]} castShadow>
          <boxGeometry args={[0.14, 2.6, 0.14]} />
          <meshStandardMaterial color="#d6dade" metalness={0.5} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 2.68, 0]} rotation-x={0.06} castShadow>
        <boxGeometry args={[w + 0.8, 0.14, d + 0.8]} />
        <meshStandardMaterial color="#1c2733" metalness={0.5} roughness={0.25} />
      </mesh>
      {/* handrails */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - 0.9), 0.6, 0]}>
          <boxGeometry args={[0.06, 0.06, d - 1]} />
          <meshStandardMaterial color="#d4a63a" />
        </mesh>
      ))}
      <RigidBody type="fixed" colliders={false}>
        {[
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ].map(([sx, sz], i) => (
          <CuboidCollider key={i} args={[0.1, 1.3, 0.1]} position={[sx * (w / 2 - 0.15), 1.3, sz * (d / 2 - 0.15)]} />
        ))}
      </RigidBody>
    </group>
  );
}

const LAMPS: [number, number][] = [
  [-5, 44], [5, 44], [-5, 22], [5, 22], [-5, -16], [5, -16], [-5, -34], [5, -34],
  [-26, 30], [26, 30], [-34, 6], [34, 6],
];

// Solar street lamps: thin pole with a small tilted panel on top, merged into one instanced mesh.
function Lamps() {
  const geo = useMemo(() => {
    const pole = new THREE.CylinderGeometry(0.06, 0.08, 4.4, 6).translate(0, 2.2, 0);
    const panel = new THREE.BoxGeometry(1.0, 0.05, 0.6).rotateZ(0.35).translate(0.2, 4.55, 0);
    const head = new THREE.BoxGeometry(0.5, 0.12, 0.25).translate(-0.35, 4.25, 0);
    return mergeGeometries([pole, panel, head].map((g) => g.toNonIndexed()));
  }, []);
  return (
    <Instances limit={LAMPS.length} geometry={geo} castShadow>
      <meshStandardMaterial color="#8c949c" metalness={0.5} roughness={0.4} />
      {LAMPS.map(([lx, lz], i) => (
        <Instance key={i} position={[lx, 0, lz]} rotation={[0, i * 1.3, 0]} />
      ))}
    </Instances>
  );
}

// Small pergola near the east lawn.
function Pergola() {
  const posts: [number, number][] = [[-1.8, -1], [1.8, -1], [-1.8, 1], [1.8, 1]];
  return (
    <group position={[27, 0, -10]}>
      {posts.map(([px, pz], i) => (
        <mesh key={i} position={[px, 1.4, pz]} castShadow>
          <boxGeometry args={[0.25, 2.8, 0.25]} />
          <meshStandardMaterial color="#cfc7b8" />
        </mesh>
      ))}
      {[-1.2, -0.4, 0.4, 1.2].map((px) => (
        <mesh key={px} position={[px * 1.3, 2.9, 0]} castShadow>
          <boxGeometry args={[0.18, 0.18, 2.8]} />
          <meshStandardMaterial color="#8a6a4a" />
        </mesh>
      ))}
      <mesh position={[0, 2.8, -1]} castShadow>
        <boxGeometry args={[4.2, 0.15, 0.2]} />
        <meshStandardMaterial color="#7a5c3e" />
      </mesh>
      <mesh position={[0, 2.8, 1]} castShadow>
        <boxGeometry args={[4.2, 0.15, 0.2]} />
        <meshStandardMaterial color="#7a5c3e" />
      </mesh>
      <RigidBody type="fixed" colliders={false}>
        {posts.map(([px, pz], i) => (
          <CuboidCollider key={i} args={[0.13, 1.4, 0.13]} position={[px, 1.4, pz]} />
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
        <meshStandardMaterial color="#f5d58a" emissive="#f5b84a" emissiveIntensity={0.25} polygonOffsetFactor={-4} {...poly} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[3.4, 3.7, 48]} />
        <meshStandardMaterial color="#ffffff" polygonOffsetFactor={-5} {...poly} />
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
      <Lamps />
      <Pergola />
      <Fountain />
    </group>
  );
}
