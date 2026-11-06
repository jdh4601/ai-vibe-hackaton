import { useMemo } from 'react';
import * as THREE from 'three';
import { Instance, Instances } from '@react-three/drei';
import { CylinderCollider, RigidBody } from '@react-three/rapier';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ENDING_POINT, LAWNS, STAIR_CANOPY, WALKWAYS } from '../game/config';
import { lawnFootpaths } from './env/layout';
import { placeTrees, type TreePlacement } from './env/placement';

function colored(g: THREE.BufferGeometry, color: string): THREE.BufferGeometry {
  const c = new THREE.Color(color);
  const n = g.getAttribute('position').count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) c.toArray(arr, i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return g.toNonIndexed();
}

// Young deciduous tree: slim trunk + lumpy crown. One merged geometry.
function buildDeciduous(): THREE.BufferGeometry {
  return mergeGeometries([
    colored(new THREE.CylinderGeometry(0.1, 0.16, 2.4, 6).translate(0, 1.2, 0), '#7a5a3c'),
    colored(new THREE.IcosahedronGeometry(1.15, 1).scale(1, 1.1, 1).translate(0, 3.1, 0), '#5aa83a'),
    colored(new THREE.IcosahedronGeometry(0.8, 1).translate(0.6, 2.6, 0.3), '#6dbb48'),
    colored(new THREE.IcosahedronGeometry(0.75, 1).translate(-0.5, 3.6, -0.2), '#4f9a34'),
  ]);
}

// Sculpted Korean pine: twisted trunk with flat layered canopy pads.
function buildPine(): THREE.BufferGeometry {
  const pad = (r: number, x: number, y: number, z: number, color: string) =>
    colored(new THREE.SphereGeometry(r, 10, 6).scale(1, 0.38, 1).translate(x, y, z), color);
  return mergeGeometries([
    colored(new THREE.CylinderGeometry(0.16, 0.26, 2.6, 7).translate(0, 1.3, 0), '#5e4630'),
    pad(1.5, 0, 2.7, 0, '#2d6a3a'),
    pad(1.2, 0.5, 3.4, 0.2, '#357a42'),
    pad(0.9, -0.3, 4.0, -0.2, '#2d6a3a'),
  ]);
}

export function Trees() {
  const { deciduous, pines } = useMemo(() => {
    const paths = [...WALKWAYS, ...lawnFootpaths(LAWNS)];
    const avoid = [
      { x: ENDING_POINT[0], z: ENDING_POINT[2], r: 5 },
      { x: STAIR_CANOPY.x, z: STAIR_CANOPY.z, r: 6 },
    ];
    const base = { edgeMargin: 1.5, walkwayMargin: 1.2, minSpacing: 3.6 };
    const dec = placeTrees(LAWNS, paths, { ...base, count: 14, seed: 20260, avoid });
    const pin = placeTrees(LAWNS, paths, { ...base, count: 6, seed: 777, avoid: [...avoid, ...dec.map((t) => ({ x: t.x, z: t.z, r: 4 }))] });
    return { deciduous: dec, pines: pin };
  }, []);
  const decGeo = useMemo(buildDeciduous, []);
  const pineGeo = useMemo(buildPine, []);

  const group = (list: TreePlacement[], geo: THREE.BufferGeometry) => (
    <Instances limit={list.length} geometry={geo} castShadow receiveShadow frustumCulled={false}>
      <meshStandardMaterial vertexColors roughness={0.9} />
      {list.map((t, i) => (
        <Instance key={i} position={[t.x, 0.15, t.z]} scale={t.scale} rotation={[0, t.rotY, 0]} />
      ))}
    </Instances>
  );

  return (
    <group>
      {group(deciduous, decGeo)}
      {group(pines, pineGeo)}
      <RigidBody type="fixed" colliders={false}>
        {[...deciduous, ...pines].map((t, i) => (
          <CylinderCollider key={i} args={[1, 0.25 * t.scale]} position={[t.x, 1, t.z]} />
        ))}
      </RigidBody>
    </group>
  );
}
