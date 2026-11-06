import { create } from 'zustand';
import type { DialogueChoiceId, DialogueScript } from '../game/types';

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

// Track E implements start/choose against data + useQuestStore. play/advance/end are usable now.
export const useDialogueStore = create<DialogueState>()((set, get) => ({
  script: null,
  index: 0,
  start: () => {},
  play: (script) => set({ script, index: 0 }),
  advance: () => {
    const { script, index } = get();
    if (!script) return;
    if (index < script.lines.length - 1) set({ index: index + 1 });
    else if (!script.choices?.length) get().end();
  },
  choose: () => {},
  end: () => {
    const { script } = get();
    set({ script: null, index: 0 });
    script?.onEnd?.();
  },
  reset: () => set({ script: null, index: 0 }),
}));
