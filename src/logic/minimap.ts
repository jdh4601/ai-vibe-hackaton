import type { Vec3 } from '../game/types';

export interface MinimapView {
  radiusPx: number; // circle radius in px
  worldRadius: number; // meters from center to edge
}

export interface MinimapPoint {
  x: number; // px from the circle center, +x right
  y: number; // px from the circle center, +y down
  clamped: boolean; // true when the target is beyond the edge and was pinned to it
}

// World offset (dx east, dz south) → screen px, rotated so the player's heading points up.
// heading: radians, 0 = facing -z (north), positive = counter-clockwise from above.
export function worldToMinimap(
  player: Vec3,
  heading: number,
  target: Vec3,
  view: MinimapView,
  edgeMarginPx = 0,
): MinimapPoint {
  const scale = view.radiusPx / view.worldRadius;
  const sx = (target[0] - player[0]) * scale;
  const sy = (target[2] - player[2]) * scale;
  const c = Math.cos(heading);
  const s = Math.sin(heading);
  let x = sx * c - sy * s;
  let y = sx * s + sy * c;
  const limit = view.radiusPx - edgeMarginPx;
  const dist = Math.hypot(x, y);
  if (dist > limit) {
    const k = limit / dist;
    return { x: x * k, y: y * k, clamped: true };
  }
  if (Object.is(x, -0)) x = 0;
  if (Object.is(y, -0)) y = 0;
  return { x, y, clamped: false };
}

// Stamina ring colour: green → yellow → red.
export function staminaColor(ratio: number): string {
  if (ratio > 0.5) return '#46c773';
  if (ratio > 0.25) return '#f2c14e';
  return '#e5484d';
}

export const radToDeg = (r: number): number => (r * 180) / Math.PI;
