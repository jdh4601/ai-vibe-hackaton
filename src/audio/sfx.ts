import { tone } from './context';

export type SfxName = 'select' | 'success' | 'fail' | 'fanfare' | 'notify' | 'coffee';

const N = { A4: 440, C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.5 };

const recipes: Record<SfxName, () => void> = {
  select: () => {
    tone({ freq: 880, dur: 0.07, type: 'triangle', gain: 0.07 });
  },
  notify: () => {
    tone({ freq: N.E5, dur: 0.1, type: 'sine', gain: 0.08 });
    tone({ freq: N.A4 * 2, start: 0.1, dur: 0.16, type: 'sine', gain: 0.08 });
  },
  success: () => {
    [N.C5, N.E5, N.G5].forEach((f, i) =>
      tone({ freq: f, start: i * 0.09, dur: 0.14, type: 'triangle', gain: 0.09 }),
    );
  },
  fail: () => {
    tone({ freq: 300, slideTo: 140, dur: 0.35, type: 'sawtooth', gain: 0.06 });
  },
  coffee: () => {
    tone({ freq: 220, slideTo: 440, dur: 0.18, type: 'sine', gain: 0.09 });
    tone({ freq: 660, start: 0.2, dur: 0.12, type: 'triangle', gain: 0.07 });
  },
  fanfare: () => {
    const seq: [number, number, number][] = [
      [N.C5, 0, 0.14], [N.C5, 0.15, 0.14], [N.C5, 0.3, 0.14],
      [N.G5, 0.45, 0.3], [N.E5, 0.8, 0.14], [N.G5, 0.95, 0.14], [N.C6, 1.1, 0.7],
    ];
    seq.forEach(([f, s, d]) => {
      tone({ freq: f, start: s, dur: d, type: 'square', gain: 0.06 });
      tone({ freq: f / 2, start: s, dur: d, type: 'triangle', gain: 0.07 });
    });
  },
};

export function playSfx(name: SfxName): void {
  try {
    recipes[name]();
  } catch {
    /* audio must never break the game */
  }
}
