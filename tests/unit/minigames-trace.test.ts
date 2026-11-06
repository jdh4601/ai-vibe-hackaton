import { describe, expect, it } from 'vitest';
import { cupPath, scoreTrace } from '../../src/logic/minigames/trace';

const opts = { coverageMin: 0.75, deviationMax: 0.2 };

describe('trace', () => {
  const path = cupPath();
  it('scoreTrace_exactPath_passes', () => {
    const r = scoreTrace(path, path, opts);
    expect(r.passed).toBe(true);
    expect(r.coverage).toBe(1);
  });
  it('scoreTrace_halfPath_failsOnCoverage', () => {
    const r = scoreTrace(path.slice(0, Math.floor(path.length / 2)), path, opts);
    expect(r.coverage).toBeLessThan(0.75);
    expect(r.passed).toBe(false);
  });
  it('scoreTrace_wrongPlace_failsOnDeviation', () => {
    const far = path.map((p) => ({ x: p.x + 80, y: p.y + 60 }));
    const r = scoreTrace(far, path, opts);
    expect(r.deviation).toBeGreaterThan(0.2);
    expect(r.passed).toBe(false);
  });
  it('scoreTrace_empty_fails', () => {
    expect(scoreTrace([], path, opts).passed).toBe(false);
  });
  it('scoreTrace_slightWobble_passes', () => {
    const wobble = path.map((p, i) => ({ x: p.x + (i % 2 ? 5 : -5), y: p.y }));
    expect(scoreTrace(wobble, path, opts).passed).toBe(true);
  });
  it('cupPath_points_insideCanvas', () => {
    for (const p of path) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(640);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(420);
    }
  });
});
