import type { Vec3 } from '../game/types';

// Ground-plane (x/z) helpers shared by the Player, NPC and event actors.

export function distance2D(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[2] - b[2]);
}

// Closest target within `radius` (inclusive) on the ground plane, or null. Ties keep the first.
export function nearestTarget<T extends { position: Vec3 }>(
  playerPos: Vec3,
  targets: readonly T[],
  radius: number,
): T | null {
  let best: T | null = null;
  let bestDist = Infinity;
  for (const t of targets) {
    const d = distance2D(playerPos, t.position);
    if (d <= radius && d < bestDist) {
      best = t;
      bestDist = d;
    }
  }
  return best;
}

// Yaw (radians) a model facing -z needs to look from `from` toward `to`.
// Convention matches usePlayerStore.heading: 0 = facing -z, counter-clockwise positive.
export function yawToward(from: Vec3, to: Vec3): number {
  return Math.atan2(-(to[0] - from[0]), -(to[2] - from[2]));
}

// Shortest signed angular difference b - a, in (-PI, PI].
export function angleDelta(a: number, b: number): number {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

// Move angle `a` toward `b` along the shortest arc by at most `maxStep` radians.
export function approachAngle(a: number, b: number, maxStep: number): number {
  const d = angleDelta(a, b);
  if (Math.abs(d) <= maxStep) return b;
  return a + Math.sign(d) * maxStep;
}
