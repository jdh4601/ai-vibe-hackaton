import { useEffect } from 'react';
import { installDevHooks } from './debug/devHooks';
import type { GamePhase } from './game/types';
import { DebugKeys } from './debug/DebugKeys';
import { useGameStore } from './stores/useGameStore';
import { useQuestStore } from './stores/useQuestStore';
import { SystemsTicker } from './systems/SystemsTicker';
import { DialogueBox } from './ui/dialogue/DialogueBox';
import { Hud } from './ui/hud/Hud';
import { MinigameModal } from './ui/minigames/MinigameModal';
import { MinigamePreview } from './ui/minigames/MinigamePreview';
import { Credits } from './ui/overlays/Credits';
import { EndingSelect } from './ui/overlays/EndingSelect';
import { JacketCeremony } from './ui/overlays/JacketCeremony';
import { OpeningSequence } from './ui/overlays/OpeningSequence';
import { SkillAcquired } from './ui/overlays/SkillAcquired';
import { SkillDex } from './ui/overlays/SkillDex';
import { UiPreview } from './ui/overlays/UiPreview';
import { CoffeeCarts } from './world/CoffeeCart';
import { EndingStage } from './world/EndingStage';
import { EventActors } from './world/EventActors';
import { GameCanvas } from './world/GameCanvas';
import { NpcLayer } from './world/NpcLayer';
import { Player } from './world/Player';

const params = new URLSearchParams(window.location.search);

// the HUD gets out of the way during the opening and every ending scene
const NO_HUD_PHASES: ReadonlySet<GamePhase> = new Set(['opening', 'endingCutscene', 'endingSelect', 'jacketCeremony', 'credits']);

function ActiveMinigame() {
  const questId = useGameStore((s) => s.activeQuestId);
  const progress = useQuestStore((s) => (questId ? s.quests[questId] : null));
  if (!questId || !progress) return null;
  const quest = useQuestStore.getState();
  return (
    <MinigameModal
      key={questId}
      questId={questId}
      hintVisible={progress.hintVisible}
      failCount={progress.failCount}
      onSuccess={() => quest.succeed(questId)}
      onFail={() => quest.fail(questId)}
      onAbort={() => quest.abort(questId)}
    />
  );
}

function Game() {
  const phase = useGameStore((s) => s.phase);

  useEffect(() => {
    if (params.get('debug') === '1') {
      useGameStore.getState().setDebug(true);
      installDevHooks();
    }
  }, []);

  return (
    <>
      <GameCanvas>
        <Player />
        <NpcLayer />
        <CoffeeCarts />
        <EventActors />
        <EndingStage />
      </GameCanvas>
      <SystemsTicker />
      <DebugKeys />
      {!NO_HUD_PHASES.has(phase) && <Hud />}
      <DialogueBox />
      {phase === 'minigame' && <ActiveMinigame />}
      {phase === 'skillAcquired' && <SkillAcquired />}
      <SkillDex />
      {phase === 'endingSelect' && <EndingSelect />}
      {phase === 'jacketCeremony' && <JacketCeremony />}
      {phase === 'credits' && <Credits />}
      {phase === 'opening' && <OpeningSequence />}
    </>
  );
}

export default function App() {
  const minigame = params.get('minigame');
  if (minigame) return <MinigamePreview kind={minigame} />;
  if (params.get('ui-preview') === '1') return <UiPreview />;
  return <Game />;
}
