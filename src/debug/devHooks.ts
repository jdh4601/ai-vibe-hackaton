import { QUESTS } from '../data/quests';
import type { GameDevHooks, GameSnapshot, QuestMachineState, RandomEventId, Vec3 } from '../game/types';
import { initialQuestState, transition } from '../logic/questMachine';
import { useEventStore } from '../stores/useEventStore';
import { useGameStore } from '../stores/useGameStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { ENDING_UNLOCK_NOTICE, useQuestStore } from '../stores/useQuestStore';
import { useSkillStore } from '../stores/useSkillStore';
import { nextQuestSpot } from '../systems/nextQuest';


function skipOpening(): void {
  useGameStore.getState().setPhase('explore');
}

function teleportTo(position: Vec3): void {
  usePlayerStore.getState().requestTeleport(position);
}

function teleportToNextQuest(): void {
  const spot = nextQuestSpot(useQuestStore.getState().quests);
  if (spot) teleportTo(spot.position);
}

function solveMinigame(): void {
  const id = useGameStore.getState().activeQuestId;
  if (id) useQuestStore.getState().succeed(id);
}

function grantAllSkills(): void {
  let state: QuestMachineState = initialQuestState();
  const skills = useSkillStore.getState();
  for (const q of QUESTS) {
    state = transition(state, { type: 'SUCCEED', questId: q.id });
    skills.grant(q.skillId);
  }
  const wasUnlocked = useQuestStore.getState().endingUnlocked;
  useQuestStore.setState({ quests: state.quests, endingUnlocked: state.endingUnlocked, deadlineQuestId: null });
  useGameStore.getState().setActiveQuest(null);
  if (!wasUnlocked) useNotificationStore.getState().push(ENDING_UNLOCK_NOTICE, '⭐');
}

function triggerEvent(id: RandomEventId): void {
  useEventStore.getState().trigger(id, performance.now());
}

function getState(): GameSnapshot {
  const player = usePlayerStore.getState();
  const quest = useQuestStore.getState();
  return {
    phase: useGameStore.getState().phase,
    player: { position: player.position, heading: player.heading, stamina: player.stamina, jacket: player.jacket },
    quests: quest.quests,
    endingUnlocked: quest.endingUnlocked,
    skills: useSkillStore.getState().acquired,
    activeEvent: useEventStore.getState().active?.id ?? null,
  };
}

export const devHooks: GameDevHooks = {
  skipOpening,
  teleportToNextQuest,
  teleportTo,
  solveMinigame,
  grantAllSkills,
  triggerEvent,
  getState,
};

// Called by App when ?debug=1.
export function installDevHooks(): void {
  window.__game = devHooks;
}
