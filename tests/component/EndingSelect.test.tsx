import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { SKILLS } from '../../src/data/skills';
import { useGameStore } from '../../src/stores/useGameStore';
import { useSkillStore } from '../../src/stores/useSkillStore';
import { EndingSelect } from '../../src/ui/overlays/EndingSelect';

beforeEach(() => {
  useGameStore.getState().reset();
  useSkillStore.getState().reset();
  act(() => void useGameStore.getState().setPhase('endingSelect'));
  act(() => void useSkillStore.getState().grant(SKILLS[0].id));
});

describe('EndingSelect', () => {
  it('render_acquiredSkill_showsDepartmentCard', () => {
    render(<EndingSelect />);
    expect(screen.getByText('어떤 시간이 제일 재밌었지?')).toBeInTheDocument();
    expect(screen.getByText('전자공학부')).toBeInTheDocument();
  });

  it('clickCard_opensConfirmAndRethinkCloses', () => {
    render(<EndingSelect />);
    fireEvent.click(screen.getByText('전자공학부'));
    expect(screen.getByText('전자공학부로 정할래?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('다시 생각해볼래'));
    expect(screen.queryByText('전자공학부로 정할래?')).toBeNull();
  });

  it('confirm_decide_choosesDepartmentAndStartsCeremony', () => {
    render(<EndingSelect />);
    fireEvent.click(screen.getByText('전자공학부'));
    fireEvent.click(screen.getByText('결정!'));
    expect(useGameStore.getState().chosenDepartmentId).toBe('ee');
    expect(useGameStore.getState().phase).toBe('jacketCeremony');
  });
});
