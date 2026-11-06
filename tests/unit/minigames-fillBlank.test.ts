import { describe, expect, it } from 'vitest';
import { isCleared, isCorrectTile } from '../../src/logic/minigames/fillBlank';

const round = { sequence: [3, 7, 11, null, 19], options: [13, 14, 15, 16], answer: 15 };
describe('fillBlank', () => {
  it('isCorrectTile_answer_true', () => expect(isCorrectTile(round, 15)).toBe(true));
  it('isCorrectTile_other_false', () => expect(isCorrectTile(round, 14)).toBe(false));
  it('isCleared_allThreeRounds_true', () => {
    expect(isCleared(2, 3)).toBe(false);
    expect(isCleared(3, 3)).toBe(true);
  });
});
