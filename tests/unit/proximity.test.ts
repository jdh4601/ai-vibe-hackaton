import { describe, expect, it } from 'vitest';
import { angleDelta, approachAngle, distance2D, nearestTarget, yawToward } from '../../src/logic/proximity';
import type { Vec3 } from '../../src/game/types';

const t = (id: string, position: Vec3) => ({ id, position });

describe('nearestTarget', () => {
  it('nearestTarget_emptyList_returnsNull', () => {
    expect(nearestTarget([0, 0, 0], [], 3)).toBeNull();
  });
  it('nearestTarget_allOutsideRadius_returnsNull', () => {
    expect(nearestTarget([0, 0, 0], [t('a', [5, 0, 0])], 3)).toBeNull();
  });
  it('nearestTarget_twoInRadius_returnsCloser', () => {
    const r = nearestTarget([0, 0, 0], [t('far', [2.5, 0, 0]), t('near', [0, 0, -1])], 3);
    expect(r?.id).toBe('near');
  });
  it('nearestTarget_exactlyOnRadius_isInclusive', () => {
    expect(nearestTarget([0, 0, 0], [t('edge', [3, 0, 0])], 3)?.id).toBe('edge');
  });
  it('nearestTarget_differentHeight_ignoresY', () => {
    expect(nearestTarget([0, 5, 0], [t('a', [1, 0, 0])], 3)?.id).toBe('a');
  });
  it('nearestTarget_tie_keepsFirst', () => {
    expect(nearestTarget([0, 0, 0], [t('a', [1, 0, 0]), t('b', [-1, 0, 0])], 3)?.id).toBe('a');
  });
});

describe('angles', () => {
  it('distance2D_pythagorean_returns5', () => {
    expect(distance2D([0, 9, 0], [3, 0, 4])).toBeCloseTo(5);
  });
  it('yawToward_north_isZero', () => {
    expect(yawToward([0, 0, 0], [0, 0, -5])).toBeCloseTo(0);
  });
  it('yawToward_west_isPositiveHalfPi', () => {
    expect(yawToward([0, 0, 0], [-5, 0, 0])).toBeCloseTo(Math.PI / 2);
  });
  it('yawToward_east_isNegativeHalfPi', () => {
    expect(yawToward([0, 0, 0], [5, 0, 0])).toBeCloseTo(-Math.PI / 2);
  });
  it('angleDelta_wrapsAcrossPi_takesShortArc', () => {
    expect(angleDelta(3, -3)).toBeCloseTo(2 * Math.PI - 6);
  });
  it('approachAngle_withinStep_snapsToTarget', () => {
    expect(approachAngle(0, 0.1, 0.5)).toBe(0.1);
  });
  it('approachAngle_farTarget_movesByStep', () => {
    expect(approachAngle(0, 2, 0.5)).toBeCloseTo(0.5);
  });
});
