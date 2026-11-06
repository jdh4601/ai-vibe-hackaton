import { describe, expect, it } from 'vitest';
import { isCorrectOrder, shuffleNotEqual } from '../../src/logic/minigames/ordering';

const answer = ['a', 'b', 'c', 'd'];
const tokens = answer.map((id) => ({ id, label: id }));
describe('ordering', () => {
  it('isCorrectOrder_exact_true', () => expect(isCorrectOrder(['a', 'b', 'c', 'd'], answer)).toBe(true));
  it('isCorrectOrder_oneSwap_false', () => expect(isCorrectOrder(['a', 'c', 'b', 'd'], answer)).toBe(false));
  it('isCorrectOrder_shorter_false', () => expect(isCorrectOrder(['a', 'b'], answer)).toBe(false));
  it('shuffleNotEqual_anySeed_neverAnswer', () => {
    for (let seed = 0; seed < 200; seed++) {
      const s = shuffleNotEqual(tokens, answer, seed).map((t) => t.id);
      expect(isCorrectOrder(s, answer)).toBe(false);
      expect([...s].sort()).toEqual(answer);
    }
  });
  it('shuffleNotEqual_sameSeed_reproducible', () => {
    expect(shuffleNotEqual(tokens, answer, 7)).toEqual(shuffleNotEqual(tokens, answer, 7));
  });
  it('shuffleNotEqual_twoTokens_swapped', () => {
    const t = [{ id: 'x', label: 'x' }, { id: 'y', label: 'y' }];
    for (let seed = 0; seed < 20; seed++) expect(shuffleNotEqual(t, ['x', 'y'], seed).map((q) => q.id)).toEqual(['y', 'x']);
  });
});
