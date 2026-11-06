import { useMemo } from 'react';
import { MeshStandardMaterial, type CanvasTexture } from 'three';
import type { JacketSpec } from '../game/types';
import { drawJacketTexture } from '../logic/jacket';

export interface JacketMaterials {
  back: MeshStandardMaterial; // torso face that carries the printed text
  body: MeshStandardMaterial; // plain jacket color
  sleeve: MeshStandardMaterial; // sleeve / stripe color
}

// Textures are shared between every character wearing the same jacket (20 NPCs + the player).
const textureCache = new Map<string, CanvasTexture>();

function textureFor(spec: JacketSpec): CanvasTexture {
  const key = `${spec.bodyColor}|${spec.sleeveColor}|${spec.backText}`;
  let tex = textureCache.get(key);
  if (!tex) {
    tex = drawJacketTexture(spec);
    textureCache.set(key, tex);
  }
  return tex;
}

// Rebuilds the materials whenever the jacket spec changes (e.g. the ceremony swaps it).
export function useJacketMaterials(spec: JacketSpec): JacketMaterials {
  const { bodyColor, sleeveColor, backText } = spec;
  return useMemo(() => {
    const map = textureFor({ bodyColor, sleeveColor, backText });
    return {
      back: new MeshStandardMaterial({ map, roughness: 0.8 }),
      body: new MeshStandardMaterial({ color: bodyColor, roughness: 0.8 }),
      sleeve: new MeshStandardMaterial({ color: sleeveColor, roughness: 0.8 }),
    };
  }, [bodyColor, sleeveColor, backText]);
}
