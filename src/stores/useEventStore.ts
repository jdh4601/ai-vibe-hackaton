import { create } from 'zustand';
import type { ActiveEvent, EventOutcome, RandomEventId } from '../game/types';

export interface EventState {
  active: ActiveEvent | null;
  lastEventId: RandomEventId | null;
  nextAt: number | null; // ms timestamp of the next scheduled event
  // Called every frame by the systems ticker (track E). Schedules via logic/eventScheduler.
  tick: (nowMs: number) => void;
  trigger: (id: RandomEventId, nowMs: number) => void; // debug F6–F8 and scheduler
  // Reported by world actors (track B): professor caught/escaped, snack booth reached, timeout.
  resolve: (outcome: EventOutcome) => void;
  reset: () => void;
}

export const useEventStore = create<EventState>()((set) => ({
  active: null,
  lastEventId: null,
  nextAt: null,
  tick: () => {},
  trigger: () => {},
  resolve: () => set({ active: null }),
  reset: () => set({ active: null, lastEventId: null, nextAt: null }),
}));
