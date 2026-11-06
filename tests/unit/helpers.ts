import { useDialogueStore } from '../../src/stores/useDialogueStore';
import { useEventStore } from '../../src/stores/useEventStore';
import { useGameStore } from '../../src/stores/useGameStore';
import { useNotificationStore } from '../../src/stores/useNotificationStore';
import { usePlayerStore } from '../../src/stores/usePlayerStore';
import { useQuestStore } from '../../src/stores/useQuestStore';
import { useSkillStore } from '../../src/stores/useSkillStore';

export function resetAllStores(): void {
  useGameStore.getState().reset();
  useQuestStore.getState().reset();
  useSkillStore.getState().reset();
  useDialogueStore.getState().reset();
  useEventStore.getState().reset();
  useNotificationStore.getState().reset();
  usePlayerStore.getState().reset();
}

export const texts = () => useNotificationStore.getState().items.map((n) => n.text);
