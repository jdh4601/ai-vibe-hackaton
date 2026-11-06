import { useMemo } from 'react';
import { MeshStandardMaterial, type CanvasTexture } from 'three';
import type { JacketSpec } from '../game/types';
import {
  drawJacketFrontTexture,
  drawJacketSideTexture,
  drawJacketTexture,
  drawSleeveNumberTexture,
} from '../logic/jacket';

export interface JacketMaterials {
  front: MeshStandardMaterial; // open front: shirt strip, snaps, pocket welts
  back: MeshStandardMaterial; // printed lettering
  side: MeshStandardMaterial; // body color + hem ribbing
  body: MeshStandardMaterial; // plain jacket color (collar, shoulders)
  sleeve: MeshStandardMaterial; // sleeve color
  sleeveNumber: MeshStandardMaterial; // transparent "27" decal for the right sleeve
}

// Textures are shared between every character wearing the same jacket (20 NPCs + the player).
const textureCache = new Map<string, CanvasTexture>();

function cached(kind: string, spec: JacketSpec, draw: (s: JacketSpec) => CanvasTexture): CanvasTexture {
  const key = `${kind}|${spec.bodyColor}|${spec.sleeveColor}|${spec.departmentLine ?? ''}`;
  let tex = textureCache.get(key);
  if (!tex) {
    tex = draw(spec);
    textureCache.set(key, tex);
  }
  return tex;
}

// Rebuilds the materials whenever the jacket spec changes (e.g. the ceremony swaps it).
export function useJacketMaterials(spec: JacketSpec): JacketMaterials {
  const { bodyColor, sleeveColor, departmentLine } = spec;
  return useMemo(() => {
    const s: JacketSpec = { bodyColor, sleeveColor, departmentLine };
    const std = (map: CanvasTexture) => new MeshStandardMaterial({ map, roughness: 0.85, emissive: '#ffffff', emissiveMap: map, emissiveIntensity: 0.3 });
    return {
      front: std(cached('front', s, (x) => drawJacketFrontTexture(x))),
      back: std(cached('back', s, drawJacketTexture)),
      side: std(cached('side', s, drawJacketSideTexture)),
      body: new MeshStandardMaterial({ color: bodyColor, roughness: 0.85, emissive: bodyColor, emissiveIntensity: 0.3 }),
      sleeve: new MeshStandardMaterial({ color: sleeveColor, roughness: 0.85, emissive: sleeveColor, emissiveIntensity: 0.3 }),
      sleeveNumber: new MeshStandardMaterial({
        map: cached('num', s, drawSleeveNumberTexture),
        transparent: true,
        roughness: 0.85,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
    };
  }, [bodyColor, sleeveColor, departmentLine]);
}
