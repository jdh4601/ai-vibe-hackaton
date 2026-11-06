export interface FillBlankRound {
  sequence: (number | null)[];
  options: number[];
  answer: number;
}

export function isCorrectTile(round: FillBlankRound, value: number): boolean {
  return value === round.answer;
}

/** The game is cleared once every round has been answered correctly. */
export function isCleared(correctRounds: number, totalRounds: number): boolean {
  return totalRounds > 0 && correctRounds >= totalRounds;
}
