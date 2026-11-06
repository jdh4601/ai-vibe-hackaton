import type { QuestId } from '../../game/types';

// Stub from Phase 0. Owned by track D (Minigames); keep the export name and props.
// Opens the minigame for QuestDef.minigame. On a failed attempt call onFail, on clear onSuccess, on [포기] onAbort.
export interface MinigameModalProps {
  questId: QuestId;
  hintVisible: boolean;
  failCount: number;
  onSuccess: () => void;
  onFail: () => void;
  onAbort: () => void;
}

export function MinigameModal(_props: MinigameModalProps) {
  return null;
}
