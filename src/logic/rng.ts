// mulberry32 seeded RNG. Deterministic for a given seed; used by the event scheduler.

export interface Rng {
  next: () => number; // [0, 1)
  int: (min: number, max: number) => number; // inclusive on both ends
  pick: <T>(arr: readonly T[]) => T;
}

export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number): number => min + Math.floor(next() * (max - min + 1));
  function pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error('pick from empty array');
    return arr[Math.floor(next() * arr.length)];
  }
  return { next, int, pick };
}
