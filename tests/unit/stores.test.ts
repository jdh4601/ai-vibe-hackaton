import { useNotificationStore } from '../../src/stores/useNotificationStore';
import { useSkillStore } from '../../src/stores/useSkillStore';
import { usePlayerStore } from '../../src/stores/usePlayerStore';

describe('stores', () => {
  beforeEach(() => {
    useSkillStore.getState().reset();
    useNotificationStore.getState().reset();
    usePlayerStore.getState().reset();
  });

  it('grant_duplicateSkill_ignored', () => {
    expect(useSkillStore.getState().grant('skill-ee')).toBe(true);
    expect(useSkillStore.getState().grant('skill-ee')).toBe(false);
    expect(useSkillStore.getState().acquired).toEqual(['skill-ee']);
  });

  it('push_moreThanThree_keepsNewestThree', () => {
    const { push } = useNotificationStore.getState();
    ['a', 'b', 'c', 'd'].forEach((t) => push(t));
    expect(useNotificationStore.getState().items.map((n) => n.text)).toEqual(['b', 'c', 'd']);
  });

  it('setJacket_newSpec_reflected', () => {
    const jacket = { bodyColor: '#111111', sleeveColor: '#39FF14', backText: 'INU 컴퓨터공학부 27' };
    usePlayerStore.getState().setJacket(jacket);
    expect(usePlayerStore.getState().jacket).toEqual(jacket);
  });
});
