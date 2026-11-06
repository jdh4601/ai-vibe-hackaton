import { useMemo } from 'react';
import * as THREE from 'three';
import { Instance, Instances } from '@react-three/drei';
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ENDING_POINT, STAIR_CANOPY, WAVE_BENCH } from '../game/config';

// Flat ribbon swept along a curve with a twist about its tangent.
function ribbonGeometry(curve: THREE.Curve<THREE.Vector3>, segs: number, width: number, thick: number, twist: (u: number) => number): THREE.BufferGeometry {
  const pos: number[] = [];
  const idx: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  const corners: [number, number][] = [[-1, 1], [1, 1], [1, -1], [-1, -1]];
  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    const p = curve.getPointAt(u);
    const t = curve.getTangentAt(u);
    const side = new THREE.Vector3().crossVectors(t, up).normalize();
    const nrm = new THREE.Vector3().crossVectors(side, t).normalize();
    const a = twist(u);
    const s2 = side.clone().multiplyScalar(Math.cos(a)).addScaledVector(nrm, Math.sin(a));
    const n2 = nrm.clone().multiplyScalar(Math.cos(a)).addScaledVector(side, -Math.sin(a));
    for (const [cx, cy] of corners) {
      const q = p.clone().addScaledVector(s2, cx * width * 0.5).addScaledVector(n2, cy * thick * 0.5);
      pos.push(q.x, q.y, q.z);
    }
    if (i < segs) {
      for (let c = 0; c < 4; c++) {
        const a0 = i * 4 + c;
        const a1 = i * 4 + ((c + 1) % 4);
        idx.push(a0, a1, a0 + 4, a1, a1 + 4, a0 + 4);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Stainless twisted ribbon bench: two thick glossy ribbons that undulate and twist.
function WaveBench() {
  const { x, z, w, d } = WAVE_BENCH;
  const geo = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 2; k++) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 60; i++) {
        const u = i / 60;
        pts.push(new THREE.Vector3((u - 0.5) * w, 0.68 + Math.sin(u * Math.PI * 5 + k * 1.6) * 0.33, (k - 0.5) * 0.72 + Math.sin(u * Math.PI * 3 + k) * 0.27));
      }
      parts.push(ribbonGeometry(new THREE.CatmullRomCurve3(pts), 150, 0.64, 0.068, (u) => Math.sin(u * Math.PI * 5 + k) * 1.15));
    }
    return mergeGeometries(parts);
  }, [w]);
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color="#c8cecb" metalness={0.9} roughness={0.23} envMapIntensity={1.2} side={THREE.DoubleSide} />
      </mesh>
      {[-0.45, -0.24, 0, 0.24, 0.45].map((u) => (
        <mesh key={u} position={[u * w, 0.24, 0]} castShadow>
          <boxGeometry args={[0.14, 0.48, 0.5]} />
          <meshStandardMaterial color="#828580" metalness={0.65} roughness={0.39} />
        </mesh>
      ))}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[w / 2, 0.6, d / 4]} position={[0, 0.6, 0]} />
      </RigidBody>
    </group>
  );
}

// Light steel frame with a slightly tilted dark solar-panel roof over a descending stair.
function StairCanopy() {
  const { x, z, w, d } = STAIR_CANOPY;
  const steps = [0, 1, 2, 3, 4, 5];
  const postXs = [-w / 2 + 0.15, w / 2 - 0.15];
  const postZs = [-d / 2 + 0.15, 0, d / 2 - 0.15];
  const frameMat = <meshStandardMaterial color="#dfe3e6" metalness={0.6} roughness={0.35} />;
  const roofW = w + 0.8;
  const roofD = d + 0.8;
  return (
    <group position={[x, 0, z]}>
      {/* light concrete side walls of the stairwell */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - 0.5), 0.35, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.3, 0.7, d - 0.4]} />
          <meshStandardMaterial color="#c9cbc8" />
        </mesh>
      ))}
      {/* steps descend toward -z (north): high at the south end, low at the north end */}
      {steps.map((s) => (
        <mesh key={s} position={[0, 0.58 - s * 0.1, d / 2 - 0.7 - s * 0.7]} receiveShadow>
          <boxGeometry args={[w - 1.5, 0.12, 0.66]} />
          <meshStandardMaterial color={s % 2 ? '#d6d6d0' : '#b9b9b3'} />
        </mesh>
      ))}
      {/* dark stairwell opening at the low end */}
      <mesh position={[0, 0.3, -d / 2 + 0.2]}>
        <boxGeometry args={[w - 1.5, 0.6, 0.1]} />
        <meshStandardMaterial color="#2a2f34" />
      </mesh>
      {postXs.flatMap((sx) =>
        postZs.map((sz) => (
          <mesh key={`${sx}_${sz}`} position={[sx, 1.4, sz]} castShadow>
            <boxGeometry args={[0.1, 2.8, 0.1]} />
            {frameMat}
          </mesh>
        )),
      )}
      {/* roof frame edges and tilted panel */}
      <group position={[0, 2.85, 0]} rotation-x={0.1}>
        {[-1, 1].map((s) => (
          <mesh key={`a${s}`} position={[s * roofW / 2, 0, 0]} castShadow>
            <boxGeometry args={[0.1, 0.16, roofD]} />
            {frameMat}
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={`b${s}`} position={[0, 0, s * roofD / 2]} castShadow>
            <boxGeometry args={[roofW, 0.16, 0.1]} />
            {frameMat}
          </mesh>
        ))}
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[roofW - 0.1, 0.05, roofD - 0.1]} />
          <meshStandardMaterial color="#1e3050" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
      {/* light railings */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - 0.5), 1.15, 0]}>
          <boxGeometry args={[0.05, 0.05, d - 0.4]} />
          {frameMat}
        </mesh>
      ))}
      <RigidBody type="fixed" colliders={false}>
        {postXs.flatMap((sx) =>
          postZs.map((sz) => <CuboidCollider key={`${sx}_${sz}`} args={[0.1, 1.4, 0.1]} position={[sx, 1.4, sz]} />),
        )}
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
  const spray = useMemo(() => mergeGeometries(Array.from({ length: 12 }, (_, i) => {
    const a = i * Math.PI / 6;
    const p = (radius: number, y: number) => new THREE.Vector3(radius * Math.cos(a), y, radius * Math.sin(a));
    return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(p(0.12, 1.6), p(0.7, 2.5), p(1.43, 0.64)), 20, 0.015, 5, false);
  })), []);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.03, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <ringGeometry args={[1.9, 3.4, 48]} />
        <meshStandardMaterial color="#cbaf76" roughness={0.68} polygonOffsetFactor={-4} {...poly} />
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
        <meshStandardMaterial color="#70a5a4" roughness={0.12} metalness={0.48} />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.3, 1.8, 12]} />
        <meshStandardMaterial color="#e9e4dc" />
      </mesh>
      <mesh geometry={spray}>
        <meshPhysicalMaterial color="#cce9ec" metalness={0.15} roughness={0.16} clearcoat={0.9} transparent opacity={0.78} />
      </mesh>
      <mesh position={[0, 0.61, 0]} rotation-x={Math.PI / 2} receiveShadow>
        <torusGeometry args={[1.72, 0.11, 9, 72]} />
        <meshStandardMaterial color="#c7c3b5" roughness={0.76} />
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
