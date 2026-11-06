import { describe, expect, it } from 'vitest';
import { angleToVoltage, isLocked, voltageToAngle } from '../../src/logic/minigames/dial';

describe('dial', () => {
  it('angleToVoltage_endpoints_zeroAndTwelve', () => {
    expect(angleToVoltage(0)).toBe(0);
    expect(angleToVoltage(270)).toBeCloseTo(12, 6);
  });
  it('angleToVoltage_curve_isMonotonic', () => {
    let prev = -1;
    for (let a = 0; a <= 270; a += 1) {
      const v = angleToVoltage(a);
      expect(v).toBeGreaterThan(prev);
      prev = v;
    }
  });
  it('angleToVoltage_curve_isNotLinear', () => {
    expect(angleToVoltage(135)).not.toBeCloseTo(6, 1);
  });
  it('voltageToAngle_roundTrip_matches', () => {
    expect(angleToVoltage(voltageToAngle(5))).toBeCloseTo(5, 6);
  });
  const hold = (vs: number[], dt = 100) => vs.map((v, i) => ({ t: i * dt, v }));
  it('isLocked_withinToleranceForHold_true', () => {
    expect(isLocked(hold(Array(12).fill(5.05)), 5, 0.1, 1000)).toBe(true);
  });
  it('isLocked_tooShort_false', () => {
    expect(isLocked(hold(Array(5).fill(5)), 5, 0.1, 1000)).toBe(false);
  });
  it('isLocked_leavesBand_timerResets', () => {
    const vs = [...Array(8).fill(5), 6, ...Array(5).fill(5)];
    expect(isLocked(hold(vs), 5, 0.1, 1000)).toBe(false);
  });
  it('isLocked_empty_false', () => {
    expect(isLocked([], 5, 0.1, 1000)).toBe(false);
  });
});
