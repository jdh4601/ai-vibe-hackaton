import {
  COFFEE_COOLDOWN_MS,
  STAMINA_IDLE_REGEN,
  STAMINA_LOCK_MS,
  STAMINA_MAX,
  STAMINA_RUN_DRAIN,
} from '../game/config';
import type { MoveMode } from '../game/types';

export interface StaminaState {
  value: number;
  lockedUntil: number; // ms; running is blocked until then
}

export interface StaminaResult extends StaminaState {
  depleted: boolean; // true only on the tick that hits 0
}

const clamp = (v: number): number => Math.max(0, Math.min(STAMINA_MAX, v));

export function tickStamina(state: StaminaState, mode: MoveMode, dtSec: number, nowMs: number): StaminaResult {
  const { value, lockedUntil } = state;
  const running = mode === 'run' && nowMs >= lockedUntil;
  let next = value;
  if (running) next = clamp(value - STAMINA_RUN_DRAIN * dtSec);
  else if (mode === 'idle') next = clamp(value + STAMINA_IDLE_REGEN * dtSec);
  const depleted = value > 0 && next <= 0;
  return { value: next, lockedUntil: depleted ? nowMs + STAMINA_LOCK_MS : lockedUntil, depleted };
}

export function canRunNow(state: StaminaState, nowMs: number): boolean {
  return state.value > 0 && nowMs >= state.lockedUntil;
}

export function coffee(
  cooldowns: Record<string, number>,
  cartId: string,
  nowMs: number,
): { ok: boolean; cooldowns: Record<string, number> } {
  if (nowMs < (cooldowns[cartId] ?? 0)) return { ok: false, cooldowns };
  return { ok: true, cooldowns: { ...cooldowns, [cartId]: nowMs + COFFEE_COOLDOWN_MS } };
}
