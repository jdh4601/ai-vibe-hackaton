import { create } from 'zustand';
import { SPAWN_POINT, STAMINA_MAX } from '../game/config';
import { coffee, tickStamina as tickStaminaLogic } from '../logic/stamina';
import type { JacketSpec, MoveMode, Vec3 } from '../game/types';
import { useNotificationStore } from './useNotificationStore';

// Matches assets/characters/hero/hero-*-v2.png (teammate-approved design):
// royal blue body, white sleeves, blue/white striped ribbing, "27" on the wearer's right sleeve only.
export const START_JACKET: JacketSpec = {
  bodyColor: '#1E3FCF',
  sleeveColor: '#FFFFFF',
  backText: 'INCHEON NATIONAL UNIVERSITY',
};

export interface PlayerState {
  position: Vec3;
  heading: number; // radians, 0 = facing -z (north), positive = counter-clockwise from above
  moveMode: MoveMode;
  stamina: number;
  staminaLockedUntil: number; // ms timestamp; running blocked until then
  jacket: JacketSpec;
  teleportTarget: Vec3 | null; // Player consumes this and calls clearTeleport()
  coffeeCooldowns: Record<string, number>; // cartId → ready-at ms
  setPose: (position: Vec3, heading: number) => void;
  setMoveMode: (mode: MoveMode) => void;
  tickStamina: (dtSec: number, nowMs: number) => void; // Player calls every frame
  canRun: (nowMs: number) => boolean;
  addStamina: (delta: number) => void; // clamps to [0, STAMINA_MAX]
  drinkCoffee: (cartId: string, nowMs: number) => boolean; // false while on cooldown
  setJacket: (jacket: JacketSpec) => void;
  requestTeleport: (position: Vec3) => void;
  clearTeleport: () => void;
  reset: () => void;
}

const initial = {
  position: SPAWN_POINT,
  heading: 0,
  moveMode: 'idle' as MoveMode,
  stamina: STAMINA_MAX,
  staminaLockedUntil: 0,
  jacket: START_JACKET,
  teleportTarget: null,
  coffeeCooldowns: {},
};

// Clock domain: callers pass performance.now() as nowMs (same as the event store).
export const usePlayerStore = create<PlayerState>()((set, get) => ({
  ...initial,
  setPose: (position, heading) => set({ position, heading }),
  setMoveMode: (moveMode) => set({ moveMode }),
  tickStamina: (dtSec, nowMs) => {
    const { stamina, staminaLockedUntil, moveMode } = get();
    const r = tickStaminaLogic({ value: stamina, lockedUntil: staminaLockedUntil }, moveMode, dtSec, nowMs);
    if (r.value === stamina && r.lockedUntil === staminaLockedUntil) return;
    set({ stamina: r.value, staminaLockedUntil: r.lockedUntil });
    if (r.depleted) useNotificationStore.getState().push('카페인이 부족합니다…', '☕');
  },
  canRun: (nowMs) => get().stamina > 0 && nowMs >= get().staminaLockedUntil,
  addStamina: (delta) => set((s) => ({ stamina: Math.max(0, Math.min(STAMINA_MAX, s.stamina + delta)) })),
  drinkCoffee: (cartId, nowMs) => {
    const r = coffee(get().coffeeCooldowns, cartId, nowMs);
    if (!r.ok) return false;
    set({ stamina: STAMINA_MAX, staminaLockedUntil: 0, coffeeCooldowns: r.cooldowns });
    return true;
  },
  setJacket: (jacket) => set({ jacket }),
  requestTeleport: (teleportTarget) => set({ teleportTarget }),
  clearTeleport: () => set({ teleportTarget: null }),
  reset: () => set(initial),
}));
