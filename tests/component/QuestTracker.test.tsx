import '@testing-library/jest-dom/vitest';
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useQuestStore } from '../../src/stores/useQuestStore';
import { QuestTracker } from '../../src/ui/hud/QuestTracker';

beforeEach(() => useQuestStore.getState().reset());

const setStatus = (id: 'q1-ee' | 'q2-design', status: 'cleared' | 'inProgress') =>
  useQuestStore.setState((s) => ({ quests: { ...s.quests, [id]: { ...s.quests[id], status } } }));

describe('QuestTracker', () => {
  it('render_initial_showsZeroOfFive', () => {
    render(<QuestTracker />);
    expect(screen.getByText('학과 체험 0/5')).toBeInTheDocument();
  });

  it('render_twoCleared_showsTwoOfFive', () => {
    act(() => {
      setStatus('q1-ee', 'cleared');
      setStatus('q2-design', 'cleared');
    });
    render(<QuestTracker />);
    expect(screen.getByText('학과 체험 2/5')).toBeInTheDocument();
  });

  it('render_inProgressQuest_showsQuestTitle', () => {
    act(() => void setStatus('q1-ee', 'inProgress'));
    render(<QuestTracker />);
    expect(screen.getByText(/볼트를 맞춰라/)).toBeInTheDocument();
  });

  it('render_deadlineQuest_showsDeadlineLine', () => {
    act(() => void useQuestStore.getState().setDeadline('q1-ee'));
    render(<QuestTracker />);
    expect(screen.getByText('오늘 마감: 전자공학부 선배 찾아가기')).toBeInTheDocument();
  });
});
