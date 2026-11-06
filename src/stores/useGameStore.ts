import { create } from 'zustand';
import type { DepartmentId, GamePhase, QuestId } from '../game/types';

export interface GameState {
  phase: GamePhase;
  debug: boolean;
  muted: boolean;
  dexOpen: boolean;
  activeQuestId: QuestId | null; // quest whose minigame is open
  chosenDepartmentId: DepartmentId | null; // set in endingSelect
  setPhase: (phase: GamePhase) => void;
  setDebug: (debug: boolean) => void;
  toggleMute: () => void;
  setDexOpen: (open: boolean) => void;
  setActiveQuest: (questId: QuestId | null) => void;
  chooseDepartment: (id: DepartmentId) => void;
  reset: () => void;
}

const initial = {
  phase: 'opening' as GamePhase,
  debug: false,
  muted: false,
  dexOpen: false,
  activeQuestId: null,
  chosenDepartmentId: null,
};

export const useGameStore = create<GameState>()((set) => ({
  ...initial,
  setPhase: (phase) => set({ phase }),
  setDebug: (debug) => set({ debug }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setDexOpen: (dexOpen) => set({ dexOpen }),
  setActiveQuest: (activeQuestId) => set({ activeQuestId }),
  chooseDepartment: (chosenDepartmentId) => set({ chosenDepartmentId }),
  reset: () => set((s) => ({ ...initial, debug: s.debug, muted: s.muted })),
}));

// true when the player may move and the world is "live"
export const isExplorePhase = (phase: GamePhase): boolean => phase === 'explore';
