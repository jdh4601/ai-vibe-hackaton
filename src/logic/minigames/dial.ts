export interface DialSample {
  t: number; // ms
  v: number; // volts
}

export const DIAL_MAX_ANGLE = 270;
export const DIAL_MAX_VOLT = 12;

/** Slightly non-linear knob curve: 0 deg -> 0 V, 270 deg -> 12 V, monotonic. */
export function angleToVoltage(angleDeg: number): number {
  const a = Math.min(DIAL_MAX_ANGLE, Math.max(0, angleDeg));
  const x = a / DIAL_MAX_ANGLE;
  return DIAL_MAX_VOLT * Math.pow(x, 1.15);
}

/** Inverse of angleToVoltage, used to draw the hint band. */
export function voltageToAngle(volts: number): number {
  const x = Math.min(1, Math.max(0, volts / DIAL_MAX_VOLT));
  return DIAL_MAX_ANGLE * Math.pow(x, 1 / 1.15);
}

/** True when the trailing run of samples stayed within tolerance for at least holdMs. */
export function isLocked(samples: DialSample[], targetV: number, tolV: number, holdMs: number): boolean {
  if (samples.length === 0) return false;
  let runStart: number | null = null;
  for (const s of samples) {
    if (Math.abs(s.v - targetV) <= tolV) {
      if (runStart === null) runStart = s.t;
    } else {
      runStart = null;
    }
  }
  if (runStart === null) return false;
  return samples[samples.length - 1].t - runStart >= holdMs;
}
