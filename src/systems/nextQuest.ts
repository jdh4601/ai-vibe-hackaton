import { ENDING_POINT } from '../game/config';
import { NPCS } from '../data/npcs';
import { QUESTS } from '../data/quests';
import type { NpcDef, QuestId, QuestProgress, Vec3 } from '../game/types';
import { useNotificationStore } from '../stores/useNotificationStore';
import { usePlayerStore } from '../stores/usePlayerStore';
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

// After a quest is cleared: carry the player straight to the next senior, or to the fountain
// once every quest is done, so the demo flows quest after quest without walking around.
export function goToNextQuest(): void {
  const spot = nextQuestSpot(useQuestStore.getState().quests);
  const notify = useNotificationStore.getState();
  if (spot) {
    usePlayerStore.getState().requestTeleport(spot.position);
    notify.push(`다음 선배에게 왔어요: ${spot.npc.displayName}`, '➡️');
    return;
  }
  // stop just short of the ★ so the ending starts when the player steps onto it
  usePlayerStore.getState().requestTeleport([ENDING_POINT[0], 1, ENDING_POINT[2] + 6]);
  notify.push('분수대 앞으로 왔어요. ★로 걸어가세요!', '⭐');
}
