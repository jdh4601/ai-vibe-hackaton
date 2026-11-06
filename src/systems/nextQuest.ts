import { NPCS } from '../data/npcs';
import { QUESTS } from '../data/quests';
import type { NpcDef, QuestId, QuestProgress, Vec3 } from '../game/types';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useQuestStore } from '../stores/useQuestStore';

const FRONT_DISTANCE_M = 2.5;

// The next uncleared quest NPC (by quest order) and a spot 2.5 m in front of it.
export function nextQuestSpot(quests: Record<QuestId, QuestProgress>): { npc: NpcDef; position: Vec3 } | null {
  const next = [...QUESTS].sort((a, b) => a.order - b.order).find((q) => quests[q.id].status !== 'cleared');
  const npc = next && NPCS.find((n) => n.id === next.npcId);
  if (!npc) return null;
  const [x, , z] = npc.position;
  return {
    npc,
    position: [x + Math.sin(npc.rotationY) * FRONT_DISTANCE_M, 1, z + Math.cos(npc.rotationY) * FRONT_DISTANCE_M],
  };
}

// After a quest is cleared: point the player at the next senior (the tracker shows it too).
export function announceNextQuest(): void {
  const spot = nextQuestSpot(useQuestStore.getState().quests);
  if (spot) useNotificationStore.getState().push(`다음 선배: ${spot.npc.displayName} (미니맵 ! 표시)`, '➡️');
}
