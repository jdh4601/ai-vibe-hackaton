import '@testing-library/jest-dom/vitest';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SKILLS } from '../../src/data/skills';
import { useSkillStore } from '../../src/stores/useSkillStore';
import { SkillList } from '../../src/ui/hud/SkillList';

beforeEach(() => {
  vi.useFakeTimers();
  useSkillStore.getState().reset();
});
afterEach(() => vi.useRealTimers());

describe('SkillList', () => {
  it('render_noSkills_showsEmptyHint', () => {
    render(<SkillList />);
    expect(screen.getByText(/아직 없음/)).toBeInTheDocument();
  });

  it('render_acquiredSkill_showsEmojiAndName', () => {
    const s = SKILLS[0];
    act(() => void useSkillStore.getState().grant(s.id));
    render(<SkillList />);
    expect(screen.getByText(s.name)).toBeInTheDocument();
    expect(screen.getByText(s.emoji)).toBeInTheDocument();
  });

  it('highlight_afterOneSecond_clearsHighlight', () => {
    const s = SKILLS[0];
    act(() => void useSkillStore.getState().grant(s.id));
    render(<SkillList />);
    expect(screen.getByTestId(`skill-${s.id}`)).toHaveClass('flash');
    act(() => void vi.advanceTimersByTime(1000));
    expect(useSkillStore.getState().highlightId).toBeNull();
    expect(screen.getByTestId(`skill-${s.id}`)).not.toHaveClass('flash');
  });
});
