import { HINT_AFTER_FAILS, REQUIRED_SKILLS } from '../game/config';
import type { QuestEvent, QuestId, QuestMachineState, QuestProgress } from '../game/types';

export const QUEST_ORDER: QuestId[] = ['q1-ee', 'q2-design', 'q3-math', 'q4-neat', 'q5-cse'];

export function initialQuestState(): QuestMachineState {
  const quests = Object.fromEntries(
    QUEST_ORDER.map((id) => [id, { status: 'available', failCount: 0, hintVisible: false }]),
  ) as Record<QuestId, QuestProgress>;
  return { quests, endingUnlocked: false };
}

function nextProgress(p: QuestProgress, event: QuestEvent): QuestProgress {
  if (p.status === 'cleared' || p.status === 'locked') return p;
  switch (event.type) {
    case 'TALK':
    case 'DECLINE':
      return p.status === 'available' ? { ...p, status: 'offered' } : p;
    case 'ACCEPT':
      return p.status === 'available' || p.status === 'offered' ? { ...p, status: 'inProgress' } : p;
    case 'FAIL': {
      const failCount = p.failCount + 1;
      return { ...p, failCount, hintVisible: p.hintVisible || failCount >= HINT_AFTER_FAILS };
    }
    case 'SUCCEED':
      return { ...p, status: 'cleared' };
    case 'ABORT':
      return p.status === 'inProgress' ? { ...p, status: 'offered' } : p;
  }
}

export function clearedCount(state: QuestMachineState): number {
  return QUEST_ORDER.filter((id) => state.quests[id].status === 'cleared').length;
}

// Pure: never mutates the input state; returns the same object when nothing changes.
export function transition(state: QuestMachineState, event: QuestEvent): QuestMachineState {
  const current = state.quests[event.questId];
  if (!current) return state;
  const updated = nextProgress(current, event);
  if (updated === current) return state;
  const next: QuestMachineState = { ...state, quests: { ...state.quests, [event.questId]: updated } };
  return { ...next, endingUnlocked: state.endingUnlocked || clearedCount(next) >= REQUIRED_SKILLS };
}
