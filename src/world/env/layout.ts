import type { Rect } from '../../game/config';
import type { Walkway } from './placement';

/** Thin diagonal footpath across each lawn (corner to corner, slightly inset). */
export function lawnFootpaths(lawns: Rect[]): Walkway[] {
  return lawns.map((l, i) => {
    const sx = i % 2 === 0 ? 1 : -1;
    return {
      from: [l.x - sx * (l.w / 2 - 1), l.z + l.d / 2 - 1],
      to: [l.x + sx * (l.w / 2 - 1), l.z - l.d / 2 + 1],
      width: 0.9,
    };
  });
}
