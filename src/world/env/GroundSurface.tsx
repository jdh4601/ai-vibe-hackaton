import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { PlaneGeometry, RepeatWrapping, SRGBColorSpace, Vector2 } from 'three';

const root = import.meta.env.BASE_URL + 'art/campus/';
const relief = new Vector2(0.58, 0.58);

// UVs follow metres so a stone slab has the same scale on every diagonal path.
export function GroundSurface({ width, depth, surface, offset = 0 }: {
  width: number; depth: number; surface: 'clay' | 'granite' | 'lawn'; offset?: number;
}) {
  const names = surface === 'lawn' ? ['lawn'] : [surface, surface + '-normal'];
  const [albedo, normal] = useTexture(names.map((name) => root + name + '.webp'), (maps) => {
    maps[0].colorSpace = SRGBColorSpace;
    for (const map of maps) {
      map.wrapS = map.wrapT = RepeatWrapping;
      map.anisotropy = 8;
    }
    if (surface === 'clay') maps[1].repeat.set(4, 4);
  });
  const geometry = useMemo(() => {
    const plane = new PlaneGeometry(width, depth);
    const uv = plane.attributes.uv!;
    const metres = surface === 'clay' ? 8 : surface === 'granite' ? 2.8 : 3.6;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * width / metres, uv.getY(i) * depth / metres);
    return plane;
  }, [width, depth, surface]);
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial map={albedo} normalMap={normal} normalScale={relief} roughness={0.93}
        polygonOffset={offset !== 0} polygonOffsetFactor={offset} polygonOffsetUnits={offset} />
    </mesh>
  );
}
