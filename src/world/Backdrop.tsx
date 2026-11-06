import { GroundSurface } from './env/GroundSurface';
import { Environment, Instance, Instances, useTexture } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { MAP_HALF } from '../game/config';
import { mulberry32 } from './env/rng';
import { makeWindowTexture } from './env/textures';

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
  vec3 near = vec3(0.20, 0.39, 0.42);
  vec3 far = vec3(0.55, 0.69, 0.71);
  vec3 col = mix(near, far, pow(t, 0.7));
  float ripple = sin(vWorld.z * 2.7 + sin(vWorld.x * 0.49)) + sin(vWorld.z * 6.0 - vWorld.x * 0.33);
  col += 0.035 * smoothstep(0.9, 1.8, ripple) * (1.0 - t);
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

// Plaza-facing cutouts keep the far treeline detailed without rendering distant leaf meshes.
function OuterTrees() {
  const canopy = useTexture(import.meta.env.BASE_URL + 'art/campus/treeline.webp', (map) => { map.colorSpace = THREE.SRGBColorSpace; });
  const geometry = useMemo(() => new THREE.PlaneGeometry(0.92, 1).translate(0, 0.5, 0), []);
  const forest = useMemo(() => {
    const rnd = mulberry32(31);
    const trees: [number, number, number, number][] = [];
    while (trees.length < 370) {
      const x = (rnd() - 0.5) * 430;
      const z = -60 + rnd() * 330;
      if (Math.abs(x) < 70 && z < 70) continue;
      if (x > 56 && x < 112 && z < -4) continue;
      trees.push([x, z, 4 + rnd() * 6, Math.atan2(-x, -z) + (rnd() - 0.5) * 0.38]);
    }
    return trees;
  }, []);
  return (
    <Instances geometry={geometry} limit={forest.length} frames={1} frustumCulled={false}>
      <meshBasicMaterial map={canopy} alphaTest={0.45} side={THREE.DoubleSide} />
      {forest.map(([x, z, height, yaw], i) => <Instance key={i} position={[x, -0.1, z]} scale={height} rotation-y={yaw} />)}
    </Instances>
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

// Two continuous coastal ridgelines. The lower north ridge leaves the sea visible.
function Mountains() {
  const geometry = useMemo(() => {
    const xyz: number[] = [];
    const indices: number[] = [];
    const segments = 380;
    for (let ring = 0; ring < 3; ring++) {
      for (let i = 0; i <= segments; i++) {
        const a = i * Math.PI * 2 / segments;
        const coast = (1 - Math.cos(a)) / 2;
        const ridge = 0.5 + 0.21 * Math.sin(9 * a) + 0.13 * Math.sin(17 * a + 1) + 0.1 * Math.cos(31 * a) + 0.04 * Math.sin(77 * a);
        const radius = 495 + ring * 43;
        const height = ring === 0 ? -6 : (9 + coast * 19) * ridge * ring;
        xyz.push(Math.sin(a) * radius, height, -Math.cos(a) * radius);
        const j = ring * (segments + 1) + i;
        if (ring < 2 && i < segments) indices.push(j, j + 1, j + segments + 1, j + 1, j + segments + 2, j + segments + 1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(xyz, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, []);
  return <mesh geometry={geometry}><meshBasicMaterial color="#849996" side={THREE.DoubleSide} /></mesh>;
}

export function Backdrop() {
  const landDepth = 520;
  const clouds = useTexture(import.meta.env.BASE_URL + 'art/campus/cloudscape.webp', (map) => { map.colorSpace = THREE.SRGBColorSpace; });
  return (
    <group>
      {/* surrounding land outside the plaza (south / east / west) */}
      <group position={[0, -0.1, -SEA_START + landDepth / 2]} rotation-x={-Math.PI / 2}>
        <GroundSurface width={1400} depth={landDepth} surface="lawn" />
      </group>
      <Environment files={import.meta.env.BASE_URL + 'art/campus/daylight.hdr'} environmentIntensity={0.52} />
      <mesh renderOrder={-10} rotation-y={0.7}>
        <sphereGeometry args={[960, 64, 32]} />
        <meshBasicMaterial map={clouds} side={THREE.BackSide} fog={false} toneMapped={false} depthWrite={false} />
      </mesh>
      <Sea />
      <Shore />
      <OuterTrees />
      <LngTanks />
      <Mountains />
    </group>
  );
}
