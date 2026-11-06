import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MAP_HALF } from '../game/config';
import { mulberry32 } from './env/rng';

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
  float t = clamp((-vWorld.z - ${SEA_START}.0) / 300.0, 0.0, 1.0);
  vec3 near = vec3(0.30, 0.74, 0.80);
  vec3 far = vec3(0.12, 0.34, 0.60);
  vec3 col = mix(near, far, pow(t, 0.6));
  col += sin(vWorld.x * 0.35) * sin(vWorld.z * 0.5) * 0.015;
  gl_FragColor = vec4(col, 1.0);
}`;

function Sea() {
  return (
    <mesh position={[0, -0.4, -SEA_START - 200]} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[1000, 400]} />
      <shaderMaterial vertexShader={SEA_VERT} fragmentShader={SEA_FRAG} />
    </mesh>
  );
}

function LngTanks() {
  const tanks = useMemo(() => [-210, -150, -90, 110, 170, 230].map((x, i) => ({ x, z: -165 - (i % 2) * 25, r: 16 + (i % 3) * 3, h: 22 })), []);
  return (
    <group>
      <mesh position={[0, -0.2, -190]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1000, 70]} />
        <meshStandardMaterial color="#8d9a8c" />
      </mesh>
      {tanks.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          <mesh position={[0, t.h / 2, 0]}>
            <cylinderGeometry args={[t.r, t.r, t.h, 28]} />
            <meshStandardMaterial color="#eef0f2" roughness={0.7} />
          </mesh>
          <mesh position={[0, t.h, 0]} scale={[1, 0.35, 1]}>
            <sphereGeometry args={[t.r, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#dfe3e6" roughness={0.7} />
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
      g.translate(x, h / 2 - 1, z);
      parts.push(g);
    };
    for (let i = 0; i < 9; i++) add(-330 + i * 80 + rnd() * 30, 300 + rnd() * 40, 70 + rnd() * 40, 40 + rnd() * 40);
    for (let i = 0; i < 6; i++) {
      add(-300 - rnd() * 40, -100 + i * 80, 60 + rnd() * 30, 30 + rnd() * 30);
      add(300 + rnd() * 40, -100 + i * 80, 60 + rnd() * 30, 30 + rnd() * 30);
    }
    return mergeGeometries(parts);
  }, []);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#6f8f7a" flatShading />
    </mesh>
  );
}

export function Backdrop() {
  const landDepth = 420;
  return (
    <group>
      {/* surrounding land outside the plaza (south / east / west) */}
      <mesh position={[0, -0.1, -SEA_START + landDepth / 2]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1000, landDepth]} />
        <meshStandardMaterial color="#6d9a58" />
      </mesh>
      <Sea />
      <LngTanks />
      <Mountains />
    </group>
  );
}
