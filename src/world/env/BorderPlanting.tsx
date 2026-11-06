import { useMemo } from 'react';
import { Instance, Instances, useTexture } from '@react-three/drei';
import { DoubleSide, PlaneGeometry, SRGBColorSpace } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mulberry32 } from './rng';

export function BorderPlanting({ width, depth }: { width: number; depth: number }) {
  const leaves = useTexture(import.meta.env.BASE_URL + 'art/campus/leaves.webp', (map) => { map.colorSpace = SRGBColorSpace; });
  const crown = useMemo(() => mergeGeometries(Array.from({ length: 12 }, (_, i) => {
    const a = i * 2.4;
    return new PlaneGeometry(0.63, 0.62).rotateX(-0.45 - i % 3 * 0.23).rotateY(a)
      .translate(Math.sin(a) * 0.19, 0.37 + i % 3 * 0.05, Math.cos(a) * 0.19);
  })), []);
  const plants = useMemo(() => {
    const random = mulberry32(13);
    const result: [number, number, number][] = [];
    for (const side of [-1, 1]) {
      for (let x = -width / 2 + 1; x < width / 2; x += 1.65) result.push([x, side * (depth / 2 + 0.28), random()]);
      for (let z = -depth / 2 + 1; z < depth / 2; z += 1.65) result.push([side * (width / 2 + 0.28), z, random()]);
    }
    return result;
  }, [width, depth]);
  return (
    <Instances geometry={crown} limit={plants.length} frames={1} castShadow receiveShadow>
      <meshStandardMaterial map={leaves} color="#c0c88e" alphaTest={0.42} side={DoubleSide} roughness={0.95} />
      {plants.map(([x, z, t], i) => <Instance key={i} position={[x, 0.12, z]} rotation-y={t * 6.28} scale={0.7 + t * 0.33} />)}
    </Instances>
  );
}
