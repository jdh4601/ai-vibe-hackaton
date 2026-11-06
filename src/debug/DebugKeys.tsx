import { useEffect } from 'react';
import type { RandomEventId } from '../game/types';
import { useGameStore } from '../stores/useGameStore';
import { devHooks } from './devHooks';

const EVENT_KEYS: Record<string, RandomEventId> = {
  F6: 'professorKidnap',
  F7: 'assignmentAlert',
  F8: 'snackEvent',
};

// FR-11 keys, active only while useGameStore.debug.
// The backtick FPS panel is owned by the world track (needs a store flag that does not exist in the contract).
export function DebugKeys() {
  const debug = useGameStore((s) => s.debug);

  useEffect(() => {
    if (!debug) return;
    const onKey = (e: KeyboardEvent) => {
      const eventId = EVENT_KEYS[e.code];
      if (eventId) devHooks.triggerEvent(eventId);
      else if (e.code === 'F1') devHooks.skipOpening();
      else if (e.code === 'F2') devHooks.teleportToNextQuest();
      else if (e.code === 'F3') devHooks.solveMinigame();
      else if (e.code === 'F4') devHooks.grantAllSkills();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [debug]);

  return null;
}
