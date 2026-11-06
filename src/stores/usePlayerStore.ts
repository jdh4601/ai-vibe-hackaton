import { create } from 'zustand';
import { SPAWN_POINT, STAMINA_MAX } from '../game/config';
import type { JacketSpec, MoveMode, Vec3 } from '../game/types';

export const START_JACKET: JacketSpec = {
  bodyColor: '#1F2A44',
  sleeveColor: '#FFFFFF',
  backText: 'INU 자유전공학부 27',
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

// Track E replaces tickStamina / drinkCoffee bodies with logic/stamina.ts. Signatures are fixed.
export const usePlayerStore = create<PlayerState>()((set, get) => ({
  ...initial,
  setPose: (position, heading) => set({ position, heading }),
  setMoveMode: (moveMode) => set({ moveMode }),
  tickStamina: () => {},
  canRun: (nowMs) => get().stamina > 0 && nowMs >= get().staminaLockedUntil,
  addStamina: (delta) => set((s) => ({ stamina: Math.max(0, Math.min(STAMINA_MAX, s.stamina + delta)) })),
  drinkCoffee: () => {
    set({ stamina: STAMINA_MAX });
    return true;
  },
  setJacket: (jacket) => set({ jacket }),
  requestTeleport: (teleportTarget) => set({ teleportTarget }),
  clearTeleport: () => set({ teleportTarget: null }),
  reset: () => set(initial),
}));
