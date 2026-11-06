import { NPCS } from '../data/npcs';
import { QUESTS } from '../data/quests';
import type { GameDevHooks, GameSnapshot, QuestMachineState, RandomEventId, Vec3 } from '../game/types';
import { initialQuestState, transition } from '../logic/questMachine';
import { useEventStore } from '../stores/useEventStore';
import { useGameStore } from '../stores/useGameStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { ENDING_UNLOCK_NOTICE, useQuestStore } from '../stores/useQuestStore';
import { useSkillStore } from '../stores/useSkillStore';

const FRONT_DISTANCE_M = 2.5;

function skipOpening(): void {
  useGameStore.getState().setPhase('explore');
}

function teleportTo(position: Vec3): void {
  usePlayerStore.getState().requestTeleport(position);
}

function teleportToNextQuest(): void {
  const { quests } = useQuestStore.getState();
  const next = [...QUESTS].sort((a, b) => a.order - b.order).find((q) => quests[q.id].status !== 'cleared');
  const npc = next && NPCS.find((n) => n.id === next.npcId);
  if (!npc) return;
  const [x, , z] = npc.position;
  teleportTo([x + Math.sin(npc.rotationY) * FRONT_DISTANCE_M, 1, z + Math.cos(npc.rotationY) * FRONT_DISTANCE_M]);
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
