import { EVENT_MAX_INTERVAL_MS, EVENT_MIN_INTERVAL_MS } from '../game/config';
import type { GamePhase, RandomEventId } from '../game/types';
import type { Rng } from './rng';

export const EVENT_IDS: RandomEventId[] = ['professorKidnap', 'assignmentAlert', 'snackEvent'];

export function nextEventDelay(rng: Rng): number {
  return EVENT_MIN_INTERVAL_MS + Math.floor(rng.next() * (EVENT_MAX_INTERVAL_MS - EVENT_MIN_INTERVAL_MS + 1));
}

// Never returns lastEventId again.
export function pickEvent(rng: Rng, lastEventId: RandomEventId | null): RandomEventId {
  return rng.pick(EVENT_IDS.filter((id) => id !== lastEventId));
}

// Events only fire while exploring; in any other phase the caller postpones.
export function shouldFire(nowMs: number, nextAt: number | null, phase: GamePhase): boolean {
  return nextAt !== null && phase === 'explore' && nowMs >= nextAt;
}
