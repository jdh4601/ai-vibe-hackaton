import { describe, expect, it } from 'vitest';
import { LAWNS, WALKWAYS } from '../../src/game/config';
import { distToSegment, isOnWalkway, placeTrees, zigzagPoints } from '../../src/world/env/placement';
import { mulberry32 } from '../../src/world/env/rng';

const opts = { count: 50, seed: 7, edgeMargin: 1, walkwayMargin: 1, minSpacing: 2, avoid: [] };

describe('world placement', () => {
  it('mulberry32_sameSeed_sameSequence', () => {
    const a = mulberry32(5);
    const b = mulberry32(5);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it('distToSegment_pointBeyondEnd_clampsToEndpoint', () => {
    expect(distToSegment(5, 0, 0, 0, 2, 0)).toBe(3);
    expect(distToSegment(1, 2, 0, 0, 2, 0)).toBe(2);
  });
  it('placeTrees_default_reachesCountInsideLawnsAwayFromWalkways', () => {
    const trees = placeTrees(LAWNS, WALKWAYS, opts);
    expect(trees.length).toBeGreaterThanOrEqual(40);
    for (const t of trees) {
      expect(LAWNS.some((l) => Math.abs(t.x - l.x) <= l.w / 2 && Math.abs(t.z - l.z) <= l.d / 2)).toBe(true);
      expect(isOnWalkway(t.x, t.z, WALKWAYS, 0)).toBe(false);
    }
  });
  it('placeTrees_sameSeed_deterministic', () => {
    expect(placeTrees(LAWNS, WALKWAYS, opts)).toEqual(placeTrees(LAWNS, WALKWAYS, opts));
  });
  it('zigzagPoints_fullTile_endsAtTileWidthAndAlternates', () => {
    const p = zigzagPoints(128, 10, 4, 32);
    expect(p[p.length - 1][0]).toBe(128);
    expect(p[0][1]).toBe(6);
    expect(p[1][1]).toBe(14);
  });
});
