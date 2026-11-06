import { EVENT_IDS, nextEventDelay, pickEvent, shouldFire } from '../../src/logic/eventScheduler';
import { createRng } from '../../src/logic/rng';
import { EVENT_MAX_INTERVAL_MS, EVENT_MIN_INTERVAL_MS } from '../../src/game/config';

describe('eventScheduler', () => {
  it('nextEventDelay_manyDraws_withinRange', () => {
    const r = createRng(11);
    for (let i = 0; i < 500; i++) {
      const d = nextEventDelay(r);
      expect(d).toBeGreaterThanOrEqual(EVENT_MIN_INTERVAL_MS);
      expect(d).toBeLessThanOrEqual(EVENT_MAX_INTERVAL_MS);
    }
  });
  it('nextEventDelay_fixedSeed_reproducible', () => {
    expect(nextEventDelay(createRng(5))).toBe(nextEventDelay(createRng(5)));
  });
  it('pickEvent_neverRepeatsLast', () => {
    const r = createRng(1);
    for (const last of EVENT_IDS) for (let i = 0; i < 100; i++) expect(pickEvent(r, last)).not.toBe(last);
  });
  it('pickEvent_noLast_anyEvent', () => {
    expect(EVENT_IDS).toContain(pickEvent(createRng(2), null));
  });
  it('shouldFire_exploreAfterDue_true', () => {
    expect(shouldFire(100, 100, 'explore')).toBe(true);
  });
  it('shouldFire_notYetDue_false', () => {
    expect(shouldFire(99, 100, 'explore')).toBe(false);
  });
  it('shouldFire_otherPhase_false', () => {
    for (const p of ['dialogue', 'minigame', 'skillAcquired', 'endingCutscene', 'opening'] as const)
      expect(shouldFire(1000, 100, p)).toBe(false);
  });
  it('shouldFire_noSchedule_false', () => {
    expect(shouldFire(1000, null, 'explore')).toBe(false);
  });
});
