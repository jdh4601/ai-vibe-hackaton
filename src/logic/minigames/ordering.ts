export function isCorrectOrder(ids: string[], answer: string[]): boolean {
  return ids.length === answer.length && ids.every((id, i) => id === answer[i]);
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleOnce<T>(items: T[], rnd: () => number): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Seeded shuffle that never returns the answer order (tokens need an id). */
export function shuffleNotEqual<T extends { id: string }>(tokens: T[], answer: string[], seed: number): T[] {
  const rnd = mulberry32(seed);
  if (tokens.length < 2) return tokens.slice();
  for (let i = 0; i < 50; i++) {
    const s = shuffleOnce(tokens, rnd);
    if (!isCorrectOrder(s.map((t) => t.id), answer)) return s;
  }
  return [...tokens.slice(1), tokens[0]];
}
