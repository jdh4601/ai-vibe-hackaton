import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MinigameModal } from '../../src/ui/minigames/MinigameModal';

const base = { questId: 'q1-ee' as const, onSuccess: () => {}, onFail: () => {}, onAbort: () => {} };

describe('MinigameModal', () => {
  it('hintVisible_afterTwoFails_showsQuestHint', () => {
    const { rerender } = render(<MinigameModal {...base} hintVisible={false} failCount={1} />);
    expect(screen.queryByTestId('hint')).toBeNull();
    expect(screen.getByTestId('fail-count')).toHaveTextContent('실패 1회');
    rerender(<MinigameModal {...base} hintVisible failCount={2} />);
    expect(screen.getByTestId('hint')).toHaveTextContent('5V');
    expect(screen.getByTestId('fail-count')).toHaveTextContent('실패 2회');
  });

  it('clickAbort_callsOnAbort', () => {
    const onAbort = vi.fn();
    render(<MinigameModal {...base} hintVisible={false} failCount={0} onAbort={onAbort} />);
    fireEvent.click(screen.getByRole('button', { name: '포기' }));
    expect(onAbort).toHaveBeenCalledTimes(1);
  });

  it('render_quest_showsTitle', () => {
    render(<MinigameModal {...base} hintVisible={false} failCount={0} />);
    expect(screen.getByRole('heading', { name: '볼트를 맞춰라' })).toBeInTheDocument();
  });

  it('render_unknownQuest_showsFallbackWithAbort', () => {
    const onAbort = vi.fn();
    render(<MinigameModal {...base} questId={'q9-none' as never} hintVisible={false} failCount={0} onAbort={onAbort} />);
    fireEvent.click(screen.getByRole('button', { name: '포기' }));
    expect(onAbort).toHaveBeenCalled();
  });
});
