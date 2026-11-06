import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderingGame } from '../../src/ui/minigames/OrderingGame';
import { PREVIEW_SPECS } from '../../src/ui/minigames/previewSpecs';

const spec = PREVIEW_SPECS['ordering-word'].spec;
const codeSpec = PREVIEW_SPECS['ordering-code'].spec;
if (spec.kind !== 'ordering' || codeSpec.kind !== 'ordering') throw new Error('bad spec');

const original = HTMLElement.prototype.getBoundingClientRect;
beforeEach(() => {
  // jsdom has no layout: lay chips out left to right by DOM index so the sortable keyboard sensor can move them
  HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    const idx = this.parentElement ? Array.from(this.parentElement.children).indexOf(this) : 0;
    const isChip = this.dataset.testid === 'chip';
    const left = isChip ? idx * 100 : 0;
    const width = isChip ? 90 : 500;
    return { x: left, y: 0, left, top: 0, right: left + width, bottom: 40, width, height: 40, toJSON: () => ({}) } as DOMRect;
  };
});
afterEach(() => {
  HTMLElement.prototype.getBoundingClientRect = original;
});

const ids = () => screen.getAllByTestId('chip').map((c) => c.dataset.id ?? '');

async function solveRound(answer: string[]) {
  const user = userEvent.setup();
  for (let target = 0; target < answer.length; target++) {
    const from = ids().indexOf(answer[target]);
    if (from === target) continue;
    screen.getAllByTestId('chip')[from].focus();
    await user.keyboard(' ');
    for (let k = 0; k < from - target; k++) await user.keyboard('{ArrowLeft}');
    await user.keyboard(' ');
    await waitFor(() => expect(ids()[target]).toBe(answer[target]));
  }
}

describe('OrderingGame', () => {
  it('keyboardReorderThenSubmit_allRounds_callsOnSuccess', async () => {
    const onSuccess = vi.fn();
    const onFail = vi.fn();
    render(<OrderingGame spec={spec} hintVisible={false} onSuccess={onSuccess} onFail={onFail} />);
    const user = userEvent.setup();
    for (const round of spec.rounds) {
      await waitFor(() => expect(screen.getByTestId('od-prompt')).toHaveTextContent(round.prompt));
      await solveRound(round.answer);
      await user.click(screen.getByRole('button', { name: '제출' }));
    }
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1), { timeout: 3000 });
    expect(onFail).not.toHaveBeenCalled();
  }, 15000);

  it('submitWrongOrder_callsOnFail', async () => {
    const onSuccess = vi.fn();
    const onFail = vi.fn();
    render(<OrderingGame spec={spec} hintVisible={false} onSuccess={onSuccess} onFail={onFail} />);
    await userEvent.setup().click(screen.getByRole('button', { name: '제출' }));
    expect(onFail).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.getByText(/순서가 맞지 않아요/)).toBeInTheDocument();
  });

  it('wordMode_chips_showPinyin', () => {
    render(<OrderingGame spec={spec} hintVisible={false} onSuccess={() => {}} onFail={() => {}} />);
    expect(screen.getByText('xuésheng')).toBeInTheDocument();
  });

  it('codeMode_success_printsTerminal200OK', async () => {
    const onSuccess = vi.fn();
    render(<OrderingGame spec={codeSpec} hintVisible={false} onSuccess={onSuccess} onFail={() => {}} />);
    await solveRound(codeSpec.rounds[0].answer);
    await userEvent.setup().click(screen.getByRole('button', { name: '제출' }));
    expect(await screen.findByTestId('od-terminal')).toHaveTextContent('200 OK');
    await waitFor(() => expect(onSuccess).toHaveBeenCalled(), { timeout: 3000 });
  }, 15000);
});
