import { createRng } from '../../src/logic/rng';

describe('rng', () => {
  it('next_sameSeed_sameSequence', () => {
    const a = createRng(42);
    const b = createRng(42);
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
  });
  it('next_differentSeed_differs', () => {
    expect(createRng(1).next()).not.toBe(createRng(2).next());
  });
  it('next_manyDraws_inUnitRange', () => {
    const r = createRng(7);
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
  it('int_range_inclusiveBounds', () => {
    const r = createRng(3);
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) seen.add(r.int(2, 4));
    expect([...seen].sort()).toEqual([2, 3, 4]);
  });
  it('pick_array_returnsMember', () => {
    expect(['a', 'b']).toContain(createRng(9).pick(['a', 'b']));
  });
  it('pick_empty_throws', () => {
    expect(() => createRng(1).pick([])).toThrow();
  });
});
