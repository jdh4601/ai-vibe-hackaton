import { initialQuestState, transition, QUEST_ORDER } from '../../src/logic/questMachine';
import type { QuestEvent, QuestMachineState } from '../../src/game/types';

const run = (s: QuestMachineState, ...events: QuestEvent[]) => events.reduce(transition, s);
const q = 'q1-ee' as const;

describe('questMachine', () => {
  it('initial_allAvailable_noEnding', () => {
    const s = initialQuestState();
    expect(QUEST_ORDER.every((id) => s.quests[id].status === 'available')).toBe(true);
    expect(s.endingUnlocked).toBe(false);
  });
  it('transition_happyPath_availableToCleared', () => {
    let s = initialQuestState();
    s = transition(s, { type: 'TALK', questId: q });
    expect(s.quests[q].status).toBe('offered');
    s = transition(s, { type: 'ACCEPT', questId: q });
    expect(s.quests[q].status).toBe('inProgress');
    s = transition(s, { type: 'SUCCEED', questId: q });
    expect(s.quests[q].status).toBe('cleared');
  });
  it('transition_decline_staysOffered', () => {
    const s = run(initialQuestState(), { type: 'TALK', questId: q }, { type: 'DECLINE', questId: q });
    expect(s.quests[q].status).toBe('offered');
  });
  it('transition_declineFromAvailable_becomesOffered', () => {
    expect(transition(initialQuestState(), { type: 'DECLINE', questId: q }).quests[q].status).toBe('offered');
  });
  it('transition_twoFails_showsHint', () => {
    let s = run(initialQuestState(), { type: 'TALK', questId: q }, { type: 'ACCEPT', questId: q });
    s = transition(s, { type: 'FAIL', questId: q });
    expect(s.quests[q]).toMatchObject({ failCount: 1, hintVisible: false, status: 'inProgress' });
    s = transition(s, { type: 'FAIL', questId: q });
    expect(s.quests[q]).toMatchObject({ failCount: 2, hintVisible: true });
  });
  it('transition_abort_backToOffered', () => {
    const s = run(initialQuestState(), { type: 'ACCEPT', questId: q }, { type: 'ABORT', questId: q });
    expect(s.quests[q].status).toBe('offered');
  });
  it('transition_abortWhenNotInProgress_noChange', () => {
    const s = initialQuestState();
    expect(transition(s, { type: 'ABORT', questId: q })).toBe(s);
  });
  it('transition_acceptWhenInProgress_noChange', () => {
    const s = run(initialQuestState(), { type: 'ACCEPT', questId: q });
    expect(transition(s, { type: 'ACCEPT', questId: q })).toBe(s);
  });
  it('transition_talkOnCleared_stateUnchanged', () => {
    const s = run(initialQuestState(), { type: 'SUCCEED', questId: q });
    expect(transition(s, { type: 'TALK', questId: q })).toBe(s);
    expect(transition(s, { type: 'FAIL', questId: q })).toBe(s);
  });
  it('transition_talkWhenOffered_noChange', () => {
    const s = run(initialQuestState(), { type: 'TALK', questId: q });
    expect(transition(s, { type: 'TALK', questId: q })).toBe(s);
  });
  it('transition_pureFunction_inputNotMutated', () => {
    const s = initialQuestState();
    const snapshot = JSON.stringify(s);
    transition(s, { type: 'TALK', questId: q });
    expect(JSON.stringify(s)).toBe(snapshot);
  });
  it('transition_fiveCleared_endingUnlocked', () => {
    let s = initialQuestState();
    QUEST_ORDER.slice(0, 4).forEach((id) => (s = transition(s, { type: 'SUCCEED', questId: id })));
    expect(s.endingUnlocked).toBe(false);
    s = transition(s, { type: 'SUCCEED', questId: 'q5-cse' });
    expect(s.endingUnlocked).toBe(true);
  });
  it('transition_unknownQuest_returnsSameState', () => {
    const s = initialQuestState();
    expect(transition(s, { type: 'TALK', questId: 'nope' as never })).toBe(s);
  });
});
