import { useMemo } from 'react';
import { BoxGeometry, Color, Float32BufferAttribute } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { BuildingDef } from '../../game/config';

// Cast shadows from real floor edges, pilasters and entrance frames using one mesh per building.
export function FacadeDetails({ def }: { def: BuildingDef }) {
  const geometry = useMemo(() => {
    const boxes: BoxGeometry[] = [];
    function block(x: number, y: number, z: number, w: number, h: number, d: number, paint: string) {
      const g = new BoxGeometry(w, h, d).translate(x, y, z);
      const tint = new Color(paint);
      g.setAttribute('color', new Float32BufferAttribute(Array.from({ length: 24 }, () => tint.toArray()).flat(), 3));
      boxes.push(g);
    }
    const { w, d, height } = def;
    const floors = Math.max(2, Math.round(height / 3.4));
    const glass = def.id === 'library';
    for (let floor = 1; floor <= floors; floor++) {
      block(0, floor * height / floors - 0.17, 0, w + 0.44, glass ? 0.21 : 0.15, d + 0.44, glass ? '#879899' : '#aea89a');
    }
    // Broad vertical fins break up the long east and west elevations.
    for (let bay = -d / 2; bay <= d / 2 + 0.01; bay += d / Math.max(2, Math.round(d / 5))) {
      for (const side of [-1, 1]) block(side * w / 2, height / 2, bay, 0.42, height, 0.28, '#aca99b');
    }
    const entry = Math.min(8.4, w * 0.38);
    const front = d / 2;
    block(0, 1.55, front + 0.06, entry, 3.1, 0.09, '#394c52');
    for (let i = -2; i <= 2; i++) block(i * entry / 4, 1.55, front + 0.13, 0.065, 3.1, 0.06, '#a1aaa8');
    block(0, 2.37, front + 0.13, entry, 0.075, 0.07, '#9aabae');
    for (const side of [-1, 1]) {
      block(side * 0.15, 1.04, front + 0.19, 0.035, 0.45, 0.09, '#d9d4c8');
      block(side * entry * 0.48, 1.67, front + 2.17, 0.14, 3.34, 0.14, '#7f8987');
    }
    return mergeGeometries(boxes);
  }, [def]);
  return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial vertexColors roughness={0.72} /></mesh>;
}
