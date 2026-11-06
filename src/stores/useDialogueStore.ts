import { create } from 'zustand';
import { getNpc, TALK_CLOSING_LINE } from '../data/npcs';
import { getQuest } from '../data/quests';
import type { DialogueChoiceId, DialogueScript, QuestId } from '../game/types';
import { useGameStore } from './useGameStore';
import { useQuestStore } from './useQuestStore';

export interface DialogueState {
  script: DialogueScript | null;
  index: number; // current line
  // Build the script for an NPC from data + quest state and open it (phase 'dialogue').
  // Quest NPC: intro → offer + choices; cleared: thanksLine only; talk NPC: intro + closing line.
  start: (npcId: string) => void;
  play: (script: DialogueScript) => void; // open an arbitrary script (coffee cart, events, success lines)
  advance: () => void; // next line; past the last line (no choices) → end()
  choose: (choice: DialogueChoiceId) => void; // only valid on the last line when choices exist
  end: () => void; // close, run script.onEnd, return to 'explore' unless onEnd changed the phase
  reset: () => void;
}

const questIdOf = (script: DialogueScript | null): QuestId | undefined =>
  script?.npcId ? getNpc(script.npcId)?.questId : undefined;

export const useDialogueStore = create<DialogueState>()((set, get) => ({
  script: null,
  index: 0,
  start: (npcId) => {
    const npc = getNpc(npcId);
    if (!npc || get().script) return;
    const quest = npc.questId ? getQuest(npc.questId) : undefined;
    let script: DialogueScript;
    if (npc.questId && quest) {
      const status = useQuestStore.getState().quests[npc.questId].status;
      if (status === 'cleared') {
        script = {
          npcId,
          voicePitch: npc.voicePitch,
          lines: [{ speaker: npc.displayName, text: quest.thanksLine }],
        };
      } else {
        script = {
          npcId,
          voicePitch: npc.voicePitch,
          lines: [...npc.intro, ...quest.offer],
          choices: [
            { id: 'accept', label: '도와준다' },
            { id: 'decline', label: '다음에' },
          ],
        };
        useQuestStore.getState().talk(npc.questId);
      }
    } else {
      script = {
        npcId,
        voicePitch: npc.voicePitch,
        lines: [...npc.intro, { speaker: npc.displayName, text: TALK_CLOSING_LINE }],
      };
    }
    set({ script, index: 0 });
    useGameStore.getState().setPhase('dialogue');
  },
  play: (script) => {
    set({ script, index: 0 });
    if (useGameStore.getState().phase === 'explore') useGameStore.getState().setPhase('dialogue');
  },
  advance: () => {
    const { script, index } = get();
    if (!script) return;
    if (index < script.lines.length - 1) set({ index: index + 1 });
    else if (!script.choices?.length) get().end();
  },
  choose: (choice) => {
    const { script } = get();
    const questId = questIdOf(script);
    if (!script || !questId) return;
    set({ script: null, index: 0 });
    if (choice === 'accept') {
      useQuestStore.getState().accept(questId);
      return;
    }
    // decline: back to explore (quest store), then show the decline line, which ends in explore again
    useQuestStore.getState().decline(questId);
    const quest = getQuest(questId);
    get().play({
      npcId: script.npcId,
      voicePitch: script.voicePitch,
      lines: [{ speaker: getNpc(script.npcId ?? '')?.displayName ?? '', text: quest?.declineLine ?? '' }],
    });
  },
  end: () => {
    const { script } = get();
    set({ script: null, index: 0 });
    script?.onEnd?.();
    if (useGameStore.getState().phase === 'dialogue') useGameStore.getState().setPhase('explore');
  },
  reset: () => set({ script: null, index: 0 }),
}));
