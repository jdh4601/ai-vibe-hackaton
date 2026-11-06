import { COFFEE_CARTS, ENDING_POINT } from '../../game/config';
import type { ActiveEvent, MinimapMarker, QuestId, QuestProgress } from '../../game/types';
import { EVENTS } from '../../data/events';
import { NPCS } from '../../data/npcs';

export interface MarkerInput {
  quests: Record<QuestId, QuestProgress>;
  endingUnlocked: boolean;
  deadlineQuestId: QuestId | null;
  activeEvent: ActiveEvent | null;
}

// Pure: which markers the minimap should show for the current game state.
export function buildMarkers(input: MarkerInput): MinimapMarker[] {
  const out: MinimapMarker[] = [];
  for (const npc of NPCS) {
    if (!npc.questId) continue;
    if (input.quests[npc.questId]?.status === 'cleared') continue;
    const isDeadline = input.deadlineQuestId === npc.questId;
    out.push({ id: `quest-${npc.id}`, kind: isDeadline ? 'deadline' : 'quest', position: npc.position, label: npc.displayName });
  }
  for (const cart of COFFEE_CARTS) out.push({ id: cart.id, kind: 'coffee', position: cart.position });
  if (input.activeEvent?.position) {
    const def = EVENTS.find((e) => e.id === input.activeEvent?.id);
    out.push({ id: 'event', kind: 'event', position: input.activeEvent.position, label: def?.icon });
  }
  if (input.endingUnlocked) out.push({ id: 'ending', kind: 'ending', position: ENDING_POINT });
  return out;
}
