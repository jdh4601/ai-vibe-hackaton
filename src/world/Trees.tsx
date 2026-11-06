import { useMemo } from 'react';
import * as THREE from 'three';
import { Instance, Instances, useTexture } from '@react-three/drei';
import { CylinderCollider, RigidBody } from '@react-three/rapier';
import { treeModel } from './env/treeModel';
import { ENDING_POINT, LAWNS, STAIR_CANOPY, WALKWAYS } from '../game/config';
import { lawnFootpaths } from './env/layout';
import { placeTrees, type TreePlacement } from './env/placement';

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
  const deciduousModel = useMemo(() => treeModel(false), []);
  const pineModel = useMemo(() => treeModel(true), []);
  const [leaf, needle] = useTexture(['leaves', 'needles'].map((name) => import.meta.env.BASE_URL + 'art/campus/' + name + '.webp'), (maps) => {
    for (const map of maps) map.colorSpace = THREE.SRGBColorSpace;
  });
  const group = (list: TreePlacement[], geo: THREE.BufferGeometry, foliage?: THREE.Texture) => (
    <Instances limit={list.length} geometry={geo} castShadow receiveShadow frustumCulled={false} frames={1}>
      <meshStandardMaterial vertexColors roughness={0.94} map={foliage} alphaTest={foliage ? 0.42 : 0}
        emissiveMap={foliage} emissive={foliage ? '#c7cdaf' : '#000000'} emissiveIntensity={0.20}
        side={foliage ? THREE.DoubleSide : THREE.FrontSide} />
      {list.map((t, i) => (
        <Instance key={i} position={[t.x, 0.15, t.z]} scale={t.scale} rotation={[0, t.rotY, 0]} />
      ))}
    </Instances>
  );
  return (
    <group>
      {group(deciduous, deciduousModel.wood)}
      {group(deciduous, deciduousModel.foliage, leaf)}
      {group(pines, pineModel.wood)}
      {group(pines, pineModel.foliage, needle)}
      <RigidBody type="fixed" colliders={false}>
        {[...deciduous, ...pines].map((t, i) => (
          <CylinderCollider key={i} args={[1, 0.25 * t.scale]} position={[t.x, 1, t.z]} />
        ))}
      </RigidBody>
    </group>
  );
}
