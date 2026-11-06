import { create } from 'zustand';
import type { QuestId, QuestMachineState, QuestProgress } from '../game/types';

export const QUEST_IDS: QuestId[] = ['q1-ee', 'q2-design', 'q3-math', 'q4-neat', 'q5-cse'];

const fresh = (): Record<QuestId, QuestProgress> =>
  Object.fromEntries(
    QUEST_IDS.map((id) => [id, { status: 'available', failCount: 0, hintVisible: false }]),
  ) as Record<QuestId, QuestProgress>;

export interface QuestState extends QuestMachineState {
  deadlineQuestId: QuestId | null; // set by the "assignment alert" event (tracker + blinking minimap marker)
  // Each action runs logic/questMachine.transition and its side effects
  // (phase changes, skill grant, notifications). Implemented by track E.
  talk: (questId: QuestId) => void;
  accept: (questId: QuestId) => void; // → phase 'minigame', activeQuestId
  decline: (questId: QuestId) => void; // → phase 'explore'
  fail: (questId: QuestId) => void; // minigame reports a failed attempt
  succeed: (questId: QuestId) => void; // → success lines → skill grant → phase 'skillAcquired'
  abort: (questId: QuestId) => void; // [포기] → phase 'explore'
  setDeadline: (questId: QuestId | null) => void;
  reset: () => void;
}

export const useQuestStore = create<QuestState>()((set) => ({
  quests: fresh(),
  endingUnlocked: false,
  deadlineQuestId: null,
  talk: () => {},
  accept: () => {},
  decline: () => {},
  fail: () => {},
  succeed: () => {},
  abort: () => {},
  setDeadline: (deadlineQuestId) => set({ deadlineQuestId }),
  reset: () => set({ quests: fresh(), endingUnlocked: false, deadlineQuestId: null }),
}));
