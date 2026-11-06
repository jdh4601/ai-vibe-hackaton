import { create } from 'zustand';

export interface SkillState {
  acquired: string[]; // skill ids in acquisition order
  highlightId: string | null; // newest skill, flashes in the HUD list
  lastGrantedId: string | null; // shown by the SkillAcquired overlay
  grant: (skillId: string) => boolean; // false if already owned
  clearHighlight: () => void;
  reset: () => void;
}

export const useSkillStore = create<SkillState>()((set, get) => ({
  acquired: [],
  highlightId: null,
  lastGrantedId: null,
  grant: (skillId) => {
    if (get().acquired.includes(skillId)) return false;
    set((s) => ({ acquired: [...s.acquired, skillId], highlightId: skillId, lastGrantedId: skillId }));
    return true;
  },
  clearHighlight: () => set({ highlightId: null }),
  reset: () => set({ acquired: [], highlightId: null, lastGrantedId: null }),
}));
