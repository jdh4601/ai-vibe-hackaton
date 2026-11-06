import { create } from 'zustand';
import { getNpc } from '../data/npcs';
import { getQuest } from '../data/quests';
import type { QuestEvent, QuestId, QuestMachineState, QuestProgress } from '../game/types';
import { initialQuestState, transition } from '../logic/questMachine';
import { useDialogueStore } from './useDialogueStore';
import { useGameStore } from './useGameStore';
import { useNotificationStore } from './useNotificationStore';
import { useSkillStore } from './useSkillStore';

export const QUEST_IDS: QuestId[] = ['q1-ee', 'q2-design', 'q3-math', 'q4-neat', 'q5-cse'];

const fresh = (): Record<QuestId, QuestProgress> => initialQuestState().quests;

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

export const ENDING_UNLOCK_NOTICE = '모든 학과 체험을 마쳤습니다. 광장 중앙 분수대로 가세요.';

export const useQuestStore = create<QuestState>()((set, get) => {
  // Applies the machine event; returns true when the state actually changed.
  const apply = (event: QuestEvent): boolean => {
    const { quests, endingUnlocked } = get();
    const next = transition({ quests, endingUnlocked }, event);
    const changed = next.quests !== quests;
    if (changed) set({ quests: next.quests, endingUnlocked: next.endingUnlocked });
    return changed;
  };

  return {
    quests: fresh(),
    endingUnlocked: false,
    deadlineQuestId: null,
    talk: (questId) => {
      apply({ type: 'TALK', questId });
    },
    accept: (questId) => {
      if (!apply({ type: 'ACCEPT', questId })) return;
      useGameStore.getState().setActiveQuest(questId);
      useGameStore.getState().setPhase('minigame');
    },
    decline: (questId) => {
      apply({ type: 'DECLINE', questId });
      useGameStore.getState().setPhase('explore');
    },
    fail: (questId) => {
      apply({ type: 'FAIL', questId });
    },
    succeed: (questId) => {
      const quest = getQuest(questId);
      const wasUnlocked = get().endingUnlocked;
      if (!apply({ type: 'SUCCEED', questId }) || !quest) return;
      const game = useGameStore.getState();
      game.setActiveQuest(null);
      if (get().deadlineQuestId === questId) set({ deadlineQuestId: null });
      const unlockedNow = !wasUnlocked && get().endingUnlocked;
      game.setPhase('dialogue');
      useDialogueStore.getState().play({
        npcId: quest.npcId,
        voicePitch: getNpc(quest.npcId)?.voicePitch ?? 220,
        lines: quest.successLines,
        onEnd: () => {
          useSkillStore.getState().grant(quest.skillId);
          useGameStore.getState().setPhase('skillAcquired');
          // pushed after the skill overlay starts so the 5 s notification outlives it
          if (unlockedNow) useNotificationStore.getState().push(ENDING_UNLOCK_NOTICE, '⭐');
        },
      });
    },
    abort: (questId) => {
      apply({ type: 'ABORT', questId });
      useGameStore.getState().setActiveQuest(null);
      useGameStore.getState().setPhase('explore');
    },
    setDeadline: (deadlineQuestId) => set({ deadlineQuestId }),
    reset: () => set({ quests: fresh(), endingUnlocked: false, deadlineQuestId: null }),
  };
});
