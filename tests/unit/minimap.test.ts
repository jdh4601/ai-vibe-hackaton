import { describe, expect, it } from 'vitest';
import { staminaColor, worldToMinimap } from '../../src/logic/minimap';

const view = { radiusPx: 90, worldRadius: 40 };

describe('worldToMinimap', () => {
  it('worldToMinimap_targetAtPlayer_returnsCenter', () => {
    const p = worldToMinimap([5, 0, 5], 0, [5, 0, 5], view);
    expect(p).toEqual({ x: 0, y: 0, clamped: false });
  });

  it('worldToMinimap_targetNorthHeadingNorth_isUp', () => {
    const p = worldToMinimap([0, 0, 0], 0, [0, 0, -20], view);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(-45);
  });

  it('worldToMinimap_targetEastHeadingNorth_isRight', () => {
    const p = worldToMinimap([0, 0, 0], 0, [10, 0, 0], view);
    expect(p.x).toBeCloseTo(22.5);
    expect(p.y).toBeCloseTo(0);
  });

  it('worldToMinimap_facingWest_westTargetIsUp', () => {
    // heading +90deg (counter-clockwise) faces west
    const p = worldToMinimap([0, 0, 0], Math.PI / 2, [-10, 0, 0], view);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(-22.5);
  });

  it('worldToMinimap_facingEast_northTargetIsLeft', () => {
    const p = worldToMinimap([0, 0, 0], -Math.PI / 2, [0, 0, -10], view);
    expect(p.x).toBeCloseTo(-22.5);
    expect(p.y).toBeCloseTo(0);
  });

  it('worldToMinimap_farTarget_clampsToCircleEdge', () => {
    const p = worldToMinimap([0, 0, 0], 0, [300, 0, 400], view);
    expect(p.clamped).toBe(true);
    expect(Math.hypot(p.x, p.y)).toBeCloseTo(90);
    expect(p.x / p.y).toBeCloseTo(0.75);
  });

  it('worldToMinimap_edgeMargin_shrinksClampRadius', () => {
    const p = worldToMinimap([0, 0, 0], 0, [0, 0, -500], view, 10);
    expect(Math.hypot(p.x, p.y)).toBeCloseTo(80);
  });
});

describe('staminaColor', () => {
  it('staminaColor_ratios_greenYellowRed', () => {
    expect(staminaColor(1)).toBe('#46c773');
    expect(staminaColor(0.4)).toBe('#f2c14e');
    expect(staminaColor(0.1)).toBe('#e5484d');
  });
});
