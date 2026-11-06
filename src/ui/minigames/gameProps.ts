import type { MinigameKind, MinigameSpec } from '../../game/types';

export type SpecOf<K extends MinigameKind> = Extract<MinigameSpec, { kind: K }>;

export interface GameProps<K extends MinigameKind> {
  spec: SpecOf<K>;
  hintVisible: boolean;
  onSuccess: () => void;
  onFail: () => void;
}
