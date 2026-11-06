import { getQuest } from '../../data/quests';
import type { QuestId } from '../../game/types';
import { DialGame } from './DialGame';
import { FillBlankGame } from './FillBlankGame';
import { KIND_DESCRIPTION, MinigameFrame } from './MinigameFrame';
import { OrderingGame } from './OrderingGame';
import { TraceGame } from './TraceGame';

// Owned by track D (Minigames). Opens the minigame for QuestDef.minigame.
// On a failed attempt call onFail, on clear onSuccess, on [포기] onAbort.
export interface MinigameModalProps {
  questId: QuestId;
  hintVisible: boolean;
  failCount: number;
  onSuccess: () => void;
  onFail: () => void;
  onAbort: () => void;
}

export function MinigameModal({ questId, hintVisible, failCount, onSuccess, onFail, onAbort }: MinigameModalProps) {
  const quest = getQuest(questId);
  if (!quest) {
    return (
      <MinigameFrame title="준비 중인 퀘스트" description="아직 이 퀘스트의 미니게임이 준비되지 않았어요." failCount={failCount} hintVisible={false} onAbort={onAbort} />
    );
  }
  const spec = quest.minigame;
  const game = { hintVisible, onSuccess, onFail };
  return (
    <MinigameFrame
      title={quest.title}
      description={KIND_DESCRIPTION[spec.kind]}
      failCount={failCount}
      hint={quest.hint}
      hintVisible={hintVisible}
      onAbort={onAbort}
    >
      {spec.kind === 'dial' && <DialGame spec={spec} {...game} />}
      {spec.kind === 'trace' && <TraceGame spec={spec} {...game} />}
      {spec.kind === 'fillBlank' && <FillBlankGame spec={spec} {...game} />}
      {spec.kind === 'ordering' && <OrderingGame spec={spec} {...game} />}
    </MinigameFrame>
  );
}
