import { tone } from './context';

// Speech blip: 40ms square wave, pitch jittered by +-10%.
export function beep(pitch: number): void {
  const jitter = 1 + (Math.random() * 0.2 - 0.1);
  tone({ freq: pitch * jitter, dur: 0.04, type: 'square', gain: 0.04 });
}
