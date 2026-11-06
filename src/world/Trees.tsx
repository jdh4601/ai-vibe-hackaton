import { useMemo } from 'react';
import * as THREE from 'three';
import { Instance, Instances } from '@react-three/drei';
import { CylinderCollider, RigidBody } from '@react-three/rapier';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ENDING_POINT, LAWNS, STAIR_CANOPY, WALKWAYS } from '../game/config';
import { placeTrees } from './env/placement';

function colored(g: THREE.BufferGeometry, color: string): THREE.BufferGeometry {
  const c = new THREE.Color(color);
  const n = g.getAttribute('position').count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) c.toArray(arr, i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return g;
}

// One merged pine (trunk + three stacked cones) so the whole forest is a single draw call.
function buildPine(): THREE.BufferGeometry {
  const trunk = colored(new THREE.CylinderGeometry(0.18, 0.26, 1.6, 8).translate(0, 0.8, 0), '#6b4a2f');
  const cones = [
    colored(new THREE.ConeGeometry(1.5, 2.2, 10).translate(0, 2.4, 0), '#2f6b3a'),
    colored(new THREE.ConeGeometry(1.15, 2.0, 10).translate(0, 3.5, 0), '#357a42'),
    colored(new THREE.ConeGeometry(0.8, 1.8, 10).translate(0, 4.5, 0), '#3d8a4a'),
  ];
  const parts = [trunk, ...cones].map((g) => g.toNonIndexed());
  return mergeGeometries(parts);
}

export function Trees() {
  const trees = useMemo(
    () =>
      placeTrees(LAWNS, WALKWAYS, {
        count: 52,
        seed: 20260,
        edgeMargin: 1.2,
        walkwayMargin: 1.5,
        minSpacing: 2.6,
        avoid: [
          { x: ENDING_POINT[0], z: ENDING_POINT[2], r: 5 },
          { x: STAIR_CANOPY.x, z: STAIR_CANOPY.z, r: 6 },
        ],
      }),
    [],
  );
  const geo = useMemo(buildPine, []);

  return (
    <group>
      <Instances limit={trees.length} geometry={geo} castShadow receiveShadow frustumCulled={false}>
        <meshStandardMaterial vertexColors roughness={0.9} />
        {trees.map((t, i) => (
          <Instance key={i} position={[t.x, 0.12, t.z]} scale={t.scale} rotation={[0, t.rotY, 0]} />
        ))}
      </Instances>
      <RigidBody type="fixed" colliders={false}>
        {trees.map((t, i) => (
          <CylinderCollider key={i} args={[1, 0.3 * t.scale]} position={[t.x, 1, t.z]} />
        ))}
      </RigidBody>
    </group>
  );
}
