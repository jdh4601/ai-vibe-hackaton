import { create } from 'zustand';
import { getDepartment } from '../data/departments';
import { EVENTS } from '../data/events';
import { getQuest, QUESTS } from '../data/quests';
import { BUILDINGS, LAWNS, MAP_HALF, PROFESSOR_STAMINA_PENALTY, STAMINA_MAX } from '../game/config';
import type { Rect } from '../game/config';
import type { ActiveEvent, EventOutcome, QuestId, RandomEventId, Vec3 } from '../game/types';
import { nextEventDelay, pickEvent, shouldFire } from '../logic/eventScheduler';
import { createRng } from '../logic/rng';
import type { Rng } from '../logic/rng';
import { useGameStore } from './useGameStore';
import { useNotificationStore } from './useNotificationStore';
import { usePlayerStore } from './usePlayerStore';
import { useQuestStore } from './useQuestStore';

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

// Clock domain: every timestamp here (nextAt, startedAt, endsAt) is performance.now() milliseconds.
const POSTPONE_MS = 3000; // retry delay when an event is due outside 'explore'
const PROFESSOR_BEHIND_M = 10;
const CLASSMATE_DISTANCE_M = 8;
const SNACK_AREA = 42; // booths are placed within +-42 m of the center (z limited by the north buildings)

function readSeed(): number {
  if (typeof window !== 'undefined') {
    const raw = new URLSearchParams(window.location.search).get('seed');
    const parsed = raw === null ? NaN : Number(raw);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Date.now();
}

let rng: Rng = createRng(readSeed());

const insideRect = (r: Rect, x: number, z: number, margin: number): boolean =>
  Math.abs(x - r.x) <= r.w / 2 + margin && Math.abs(z - r.z) <= r.d / 2 + margin;

export function randomSnackPoint(r: Rng): Vec3 {
  for (let i = 0; i < 60; i++) {
    const x = (r.next() * 2 - 1) * SNACK_AREA;
    const z = -38 + r.next() * 76; // [-38, 38]
    if (BUILDINGS.some((b) => insideRect(b, x, z, 3))) continue;
    if (LAWNS.some((l) => insideRect(l, x, z, 1))) continue;
    return [x, 0, z];
  }
  return [20, 0, 28];
}

// A point `distance` meters from the player, opposite to the facing direction (heading 0 faces -z).
function behindPlayer(distance: number): Vec3 {
  const { position, heading } = usePlayerStore.getState();
  const limit = MAP_HALF - 2;
  const clamp = (v: number) => Math.max(-limit, Math.min(limit, v));
  return [clamp(position[0] + Math.sin(heading) * distance), 0, clamp(position[2] + Math.cos(heading) * distance)];
}

const notify = (text: string, icon?: string) => useNotificationStore.getState().push(text, icon);

export const useEventStore = create<EventState>()((set, get) => ({
  active: null,
  lastEventId: null,
  nextAt: null,
  tick: (nowMs) => {
    const { active, nextAt, lastEventId } = get();
    if (active) {
      if (nowMs >= active.endsAt) get().resolve(active.id === 'professorKidnap' ? 'escaped' : 'expired');
      return;
    }
    if (nextAt === null) {
      set({ nextAt: nowMs + nextEventDelay(rng) });
      return;
    }
    const phase = useGameStore.getState().phase;
    if (shouldFire(nowMs, nextAt, phase)) get().trigger(pickEvent(rng, lastEventId), nowMs);
    else if (nowMs >= nextAt && phase !== 'explore') set({ nextAt: nowMs + POSTPONE_MS });
  },
  trigger: (id, nowMs) => {
    const def = EVENTS.find((e) => e.id === id);
    if (!def) return;
    let position: Vec3 | undefined;
    if (id === 'professorKidnap') {
      position = behindPlayer(PROFESSOR_BEHIND_M);
    } else if (id === 'assignmentAlert') {
      const pending = QUESTS.filter((q) => useQuestStore.getState().quests[q.id].status !== 'cleared');
      if (pending.length === 0) {
        set({ nextAt: nowMs + nextEventDelay(rng) });
        return;
      }
      const quest = rng.pick(pending);
      useQuestStore.getState().setDeadline(quest.id);
      position = behindPlayer(CLASSMATE_DISTANCE_M);
      announceDeadline(quest.id);
    } else {
      position = randomSnackPoint(rng);
    }
    if (id !== 'assignmentAlert') notify(def.startNotice, def.icon);
    set({
      active: { id, startedAt: nowMs, endsAt: nowMs + def.durationMs, position },
      lastEventId: id,
      nextAt: nowMs + def.durationMs + nextEventDelay(rng),
    });
  },
  resolve: (outcome) => {
    const { active } = get();
    if (!active) return;
    if (active.id === 'professorKidnap') {
      if (outcome === 'caught') {
        notify('대학원 진학 권유를 30분간 들었습니다…', '🎓');
        usePlayerStore.getState().addStamina(-PROFESSOR_STAMINA_PENALTY);
      } else {
        notify('회피 성공! 오늘도 학부생으로 살아남았다', '🏃');
      }
    } else if (active.id === 'snackEvent' && outcome === 'reached') {
      usePlayerStore.getState().addStamina(STAMINA_MAX);
      notify('간식 획득!', '🍪');
    }
    set({ active: null, nextAt: performance.now() + nextEventDelay(rng) });
  },
  reset: () => {
    rng = createRng(readSeed());
    set({ active: null, lastEventId: null, nextAt: null });
  },
}));

function announceDeadline(questId: QuestId): void {
  const quest = getQuest(questId);
  const dept = quest ? getDepartment(quest.departmentId) : undefined;
  const def = EVENTS.find((e) => e.id === 'assignmentAlert');
  if (def) notify(def.startNotice, def.icon);
  notify(`오늘 마감: ${dept?.name ?? ''} 선배 찾아가기`, '📌');
}
