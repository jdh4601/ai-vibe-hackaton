import type { Rect } from '../../game/config';
import { mulberry32 } from './rng';

export interface Walkway {
  from: [number, number];
  to: [number, number];
  width: number;
}

/** Distance from point (px,pz) to segment (x1,z1)-(x2,z2). */
export function distToSegment(px: number, pz: number, x1: number, z1: number, x2: number, z2: number): number {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const len2 = dx * dx + dz * dz;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (pz - z1) * dz) / len2));
  return Math.hypot(px - (x1 + t * dx), pz - (z1 + t * dz));
}

export function isOnWalkway(x: number, z: number, walkways: Walkway[], margin = 0): boolean {
  return walkways.some((w) => distToSegment(x, z, w.from[0], w.from[1], w.to[0], w.to[1]) < w.width / 2 + margin);
}

export interface TreePlacement {
  x: number;
  z: number;
  scale: number;
  rotY: number;
}

export interface TreeOptions {
  count: number;
  seed: number;
  edgeMargin: number; // keep trees this far inside each lawn edge
  walkwayMargin: number;
  minSpacing: number;
  avoid: { x: number; z: number; r: number }[];
}

/** Seeded tree positions inside lawns, away from walkways and each other. */
export function placeTrees(lawns: Rect[], walkways: Walkway[], opts: TreeOptions): TreePlacement[] {
  const rnd = mulberry32(opts.seed);
  const out: TreePlacement[] = [];
  let tries = 0;
  while (out.length < opts.count && tries < opts.count * 80) {
    tries++;
    const lawn = lawns[Math.floor(rnd() * lawns.length)];
    const x = lawn.x + (rnd() - 0.5) * (lawn.w - 2 * opts.edgeMargin);
    const z = lawn.z + (rnd() - 0.5) * (lawn.d - 2 * opts.edgeMargin);
    const scale = 0.8 + rnd() * 0.7;
    const rotY = rnd() * Math.PI * 2;
    if (isOnWalkway(x, z, walkways, opts.walkwayMargin)) continue;
    if (opts.avoid.some((a) => Math.hypot(x - a.x, z - a.z) < a.r)) continue;
    if (out.some((t) => Math.hypot(x - t.x, z - t.z) < opts.minSpacing)) continue;
    out.push({ x, z, scale, rotY });
  }
  return out;
}

/** Zigzag polyline across a tile of `size` px at vertical offset y, tiling seamlessly when size % period === 0. */
export function zigzagPoints(size: number, y: number, amplitude: number, period: number): [number, number][] {
  const pts: [number, number][] = [];
  const half = period / 2;
  const n = Math.round(size / half);
  for (let i = 0; i <= n; i++) pts.push([i * half, y + (i % 2 === 0 ? -amplitude : amplitude)]);
  return pts;
}
