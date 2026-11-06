import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MAP_HALF } from '../game/config';
import { mulberry32 } from './env/rng';
import { makeCloudTexture, makeSkyTexture, makeWindowTexture } from './env/textures';

const SEA_START = MAP_HALF + 2; // sea begins just north (-z) of the plaza edge

const SEA_VERT = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const SEA_FRAG = /* glsl */ `
varying vec3 vWorld;
void main() {
  float t = clamp((-vWorld.z - ${SEA_START}.0) / 400.0, 0.0, 1.0);
  vec3 near = vec3(0.16, 0.45, 0.74);
  vec3 far = vec3(0.40, 0.65, 0.88);
  vec3 col = mix(near, far, pow(t, 0.7));
  col += sin(vWorld.x * 0.35) * sin(vWorld.z * 0.5) * 0.012;
  gl_FragColor = vec4(col, 1.0);
}`;

function Sea() {
  return (
    <mesh position={[0, -0.3, -SEA_START - 250]} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[1400, 500]} />
      <shaderMaterial vertexShader={SEA_VERT} fragmentShader={SEA_FRAG} />
    </mesh>
  );
}

// Thin pale seawall at the plaza edge, a long breakwater, and the far tower / long glass block beyond the campus.
function Shore() {
  const glass = useMemo(() => makeWindowTexture({ wall: '#a6b5a2', glass: '#bcd6cc', cols: 16, rows: 4, winW: 0.9, winH: 0.6 }), []);
  const tower = useMemo(() => makeWindowTexture({ wall: '#d8c9ad', glass: '#8aa0b2', cols: 4, rows: 12, winW: 0.5, winH: 0.5 }), []);
  return (
    <group>
      {/* seawall along the north plaza edge */}
      <mesh position={[0, -0.05, -SEA_START + 1.2]}>
        <boxGeometry args={[400, 0.7, 2.4]} />
        <meshStandardMaterial color="#d9d6cc" />
      </mesh>
      {/* breakwater */}
      <mesh position={[40, 0.1, -SEA_START - 75]}>
        <boxGeometry args={[420, 1.2, 3]} />
        <meshStandardMaterial color="#b4b6b4" />
      </mesh>
      {/* tall beige tower beyond the campus, on the west side of the north gap */}
      <mesh position={[-52, 17, -SEA_START + 4]}>
        <boxGeometry args={[12, 34, 10]} />
        <meshStandardMaterial map={tower} />
      </mesh>
      {/* long greenish-glass building east of the plaza */}
      <mesh position={[104, 8, -50]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[90, 16, 10]} />
        <meshStandardMaterial map={glass} metalness={0.2} roughness={0.35} />
      </mesh>
    </group>
  );
}

// Park-green land outside the plaza with scattered tree clumps (one merged mesh).
function OuterTrees() {
  const geo = useMemo(() => {
    const rnd = mulberry32(31);
    const parts: THREE.BufferGeometry[] = [];
    const paint = (g: THREE.BufferGeometry, c: THREE.Color) => {
      const n = g.getAttribute('position').count;
      const arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) c.toArray(arr, i * 3);
      g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
      return g;
    };
    let placed = 0;
    while (placed < 160) {
      const cx = (rnd() - 0.5) * 360;
      const cz = -40 + rnd() * 330;
      if (Math.abs(cx) < 70 && cz < 70) continue; // keep clear of the plaza
      if (cx > 56 && cx < 112 && cz > -96 && cz < -4) continue; // glass building
      const n = 2 + Math.floor(rnd() * 4);
      for (let k = 0; k < n; k++) {
        const x = cx + (rnd() - 0.5) * 12;
        const z = cz + (rnd() - 0.5) * 12;
        const h = 5 + rnd() * 4;
        const trunk = paint(new THREE.CylinderGeometry(0.25, 0.35, h * 0.5, 5).translate(x, h * 0.25, z), new THREE.Color('#6b4a32'));
        const crown = paint(new THREE.IcosahedronGeometry(2 + rnd() * 1.5, 0).translate(x, h * 0.75, z), new THREE.Color().setHSL(0.27 + rnd() * 0.04, 0.5, 0.3 + rnd() * 0.1));
        parts.push(trunk.toNonIndexed(), crown.toNonIndexed());
        placed++;
      }
    }
    return mergeGeometries(parts);
  }, []);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial vertexColors flatShading />
    </mesh>
  );
}

function SkyDome() {
  const tex = useMemo(() => makeSkyTexture(), []);
  return (
    <mesh renderOrder={-10}>
      <sphereGeometry args={[1000, 24, 16]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
}

function LngTanks() {
  const tanks = useMemo(() => Array.from({ length: 6 }, (_, i) => ({ x: -150 + i * 26 + (i % 2) * 4, z: -170, r: 10 })), []);
  return (
    <group>
      <mesh position={[-60, -0.1, -170]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[260, 40]} />
        <meshStandardMaterial color="#8fae78" />
      </mesh>
      {tanks.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          <mesh position={[0, 6, 0]}>
            <cylinderGeometry args={[t.r, t.r, 12, 28]} />
            <meshStandardMaterial color="#d3e8d5" roughness={0.7} />
          </mesh>
          <mesh position={[0, 12, 0]} scale={[1, 0.4, 1]}>
            <sphereGeometry args={[t.r, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#bfdcc8" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Mountains() {
  const geo = useMemo(() => {
    const rnd = mulberry32(99);
    const parts: THREE.BufferGeometry[] = [];
    const add = (x: number, z: number, r: number, h: number) => {
      const g = new THREE.ConeGeometry(r, h, 7, 1);
      g.translate(x, h / 2 - 2, z);
      parts.push(g.toNonIndexed());
    };
    for (let i = 0; i < 12; i++) add(-440 + i * 80 + rnd() * 30, 460 + rnd() * 30, 90 + rnd() * 40, 35 + rnd() * 35); // south
    for (let i = 0; i < 12; i++) add(-440 + i * 80 + rnd() * 30, -520 - rnd() * 30, 90 + rnd() * 50, 18 + rnd() * 22); // north, low on the horizon
    for (let i = 0; i < 8; i++) {
      add(-460 - rnd() * 30, -400 + i * 110, 80 + rnd() * 30, 25 + rnd() * 30);
      add(460 + rnd() * 30, -400 + i * 110, 80 + rnd() * 30, 25 + rnd() * 30);
    }
    return mergeGeometries(parts);
  }, []);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#8da7c6" flatShading />
    </mesh>
  );
}

function Clouds() {
  const tex = useMemo(() => makeCloudTexture(), []);
  const clouds = useMemo(() => {
    const rnd = mulberry32(5);
    return Array.from({ length: 14 }, () => ({ x: (rnd() - 0.5) * 900, z: -500 + rnd() * 700, y: 160 + rnd() * 90, s: 160 + rnd() * 180 }));
  }, []);
  return (
    <group>
      {clouds.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} rotation-x={Math.PI / 2} scale={[c.s, c.s * 0.5, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={tex} transparent depthWrite={false} fog={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

export function Backdrop() {
  const landDepth = 520;
  return (
    <group>
      {/* surrounding land outside the plaza (south / east / west) */}
      <mesh position={[0, -0.1, -SEA_START + landDepth / 2]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1400, landDepth]} />
        <meshStandardMaterial color="#7eaa5c" />
      </mesh>
      <SkyDome />
      <Sea />
      <Shore />
      <OuterTrees />
      <LngTanks />
      <Mountains />
      <Clouds />
    </group>
  );
}
