import { canRunNow, coffee, tickStamina } from '../../src/logic/stamina';
import { COFFEE_COOLDOWN_MS, STAMINA_LOCK_MS } from '../../src/game/config';

const s = (value: number, lockedUntil = 0) => ({ value, lockedUntil });

describe('stamina', () => {
  it('tick_runOneSecond_drains12', () => {
    expect(tickStamina(s(100), 'run', 1, 1000).value).toBe(88);
  });
  it('tick_idleOneSecond_regens4', () => {
    expect(tickStamina(s(50), 'idle', 1, 1000).value).toBe(54);
  });
  it('tick_walk_noChange', () => {
    expect(tickStamina(s(50), 'walk', 1, 0)).toEqual({ value: 50, lockedUntil: 0, depleted: false });
  });
  it('tick_idleAtMax_staysMax', () => {
    expect(tickStamina(s(99), 'idle', 5, 0).value).toBe(100);
  });
  it('tick_hitsZero_locksForThreeSecondsOnce', () => {
    const r = tickStamina(s(5), 'run', 1, 10_000);
    expect(r).toEqual({ value: 0, lockedUntil: 10_000 + STAMINA_LOCK_MS, depleted: true });
    const again = tickStamina(r, 'run', 1, 10_100);
    expect(again.depleted).toBe(false);
    expect(again.lockedUntil).toBe(r.lockedUntil);
  });
  it('tick_runWhileLocked_noDrain', () => {
    expect(tickStamina(s(10, 5000), 'run', 1, 4000).value).toBe(10);
  });
  it('canRunNow_lockedOrEmpty_false', () => {
    expect(canRunNow(s(10, 5000), 4000)).toBe(false);
    expect(canRunNow(s(0), 4000)).toBe(false);
    expect(canRunNow(s(10, 5000), 5000)).toBe(true);
  });
  it('coffee_firstUse_okAndCooldownSet', () => {
    const r = coffee({}, 'cart-west', 1000);
    expect(r.ok).toBe(true);
    expect(r.cooldowns['cart-west']).toBe(1000 + COFFEE_COOLDOWN_MS);
  });
  it('coffee_onCooldown_rejected', () => {
    const first = coffee({}, 'cart-west', 1000);
    const r = coffee(first.cooldowns, 'cart-west', 5000);
    expect(r.ok).toBe(false);
    expect(r.cooldowns).toBe(first.cooldowns);
  });
  it('coffee_otherCart_independent', () => {
    const first = coffee({}, 'cart-west', 1000);
    expect(coffee(first.cooldowns, 'cart-east', 1500).ok).toBe(true);
  });
  it('coffee_afterCooldown_ok', () => {
    const first = coffee({}, 'c', 0);
    expect(coffee(first.cooldowns, 'c', COFFEE_COOLDOWN_MS).ok).toBe(true);
  });
});
