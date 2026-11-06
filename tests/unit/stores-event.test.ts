import { BUILDINGS, PROFESSOR_STAMINA_PENALTY } from '../../src/game/config';
import { randomSnackPoint, useEventStore } from '../../src/stores/useEventStore';
import { useGameStore } from '../../src/stores/useGameStore';
import { usePlayerStore } from '../../src/stores/usePlayerStore';
import { useQuestStore } from '../../src/stores/useQuestStore';
import { createRng } from '../../src/logic/rng';
import { EVENT_MAX_INTERVAL_MS, EVENT_MIN_INTERVAL_MS } from '../../src/game/config';
import { resetAllStores, texts } from './helpers';

const ev = () => useEventStore.getState();
const player = () => usePlayerStore.getState();

describe('event store', () => {
  beforeEach(() => {
    resetAllStores();
    useGameStore.getState().setPhase('explore');
  });

  it('tick_firstCall_schedulesNextWithinInterval', () => {
    ev().tick(1000);
    const delay = ev().nextAt! - 1000;
    expect(delay).toBeGreaterThanOrEqual(EVENT_MIN_INTERVAL_MS);
    expect(delay).toBeLessThanOrEqual(EVENT_MAX_INTERVAL_MS);
    expect(ev().active).toBeNull();
  });

  it('tick_dueInExplore_triggersEvent', () => {
    ev().tick(0);
    ev().tick(ev().nextAt!);
    expect(ev().active).not.toBeNull();
    expect(ev().lastEventId).toBe(ev().active!.id);
  });

  it('tick_dueInDialogue_postponedNotFired', () => {
    ev().tick(0);
    const due = ev().nextAt!;
    useGameStore.getState().setPhase('dialogue');
    ev().tick(due + 1);
    expect(ev().active).toBeNull();
    expect(ev().nextAt).toBeGreaterThan(due);
    useGameStore.getState().setPhase('explore');
    ev().tick(ev().nextAt! + 1);
    expect(ev().active).not.toBeNull();
  });

  it('tick_notDueYet_noEvent', () => {
    ev().tick(0);
    ev().tick(1000);
    expect(ev().active).toBeNull();
  });

  it('tick_consecutiveEvents_neverSameId', () => {
    let last = null;
    for (let i = 0; i < 20; i++) {
      ev().resolve('expired');
      useEventStore.setState({ active: null });
      ev().tick(0);
      useEventStore.setState({ nextAt: 0 });
      ev().tick(1);
      const id = ev().active?.id;
      expect(id).toBeDefined();
      expect(id).not.toBe(last);
      last = id;
    }
  });

  it('tick_activeEventTimesOut_resolvedAndRescheduled', () => {
    ev().trigger('snackEvent', 0);
    const endsAt = ev().active!.endsAt;
    ev().tick(endsAt - 1);
    expect(ev().active).not.toBeNull();
    ev().tick(endsAt);
    expect(ev().active).toBeNull();
    expect(ev().nextAt).not.toBeNull();
  });

  it('tick_professorTimesOut_escapedMessage', () => {
    ev().trigger('professorKidnap', 0);
    ev().tick(ev().active!.endsAt);
    expect(texts()).toContain('회피 성공! 오늘도 학부생으로 살아남았다');
  });

  it('trigger_professor_noticeAndSpawnTenMetersBehind', () => {
    player().setPose([5, 1, 5], 0); // facing -z → behind is +z
    ev().trigger('professorKidnap', 100);
    expect(texts()).toContain('교수님이 다가옵니다! 도망치세요!');
    const a = ev().active!;
    expect(a.id).toBe('professorKidnap');
    expect(a.position![0]).toBeCloseTo(5);
    expect(a.position![2]).toBeCloseTo(15);
    expect(a.endsAt).toBe(100 + 8000);
  });

  it('trigger_professorHeadingEast_spawnsWest', () => {
    player().setPose([0, 1, 0], -Math.PI / 2); // facing +x → behind is -x
    ev().trigger('professorKidnap', 0);
    expect(ev().active!.position![0]).toBeCloseTo(-10);
  });

  it('trigger_professorNearMapEdge_clampedInsideMap', () => {
    player().setPose([0, 1, 55], 0);
    ev().trigger('professorKidnap', 0);
    expect(ev().active!.position![2]).toBeLessThanOrEqual(58);
  });

  it('resolve_caught_penaltyAndMessage', () => {
    ev().trigger('professorKidnap', 0);
    ev().resolve('caught');
    expect(player().stamina).toBe(100 - PROFESSOR_STAMINA_PENALTY);
    expect(texts()).toContain('대학원 진학 권유를 30분간 들었습니다…');
    expect(ev().active).toBeNull();
  });

  it('resolve_escaped_message', () => {
    ev().trigger('professorKidnap', 0);
    ev().resolve('escaped');
    expect(texts()).toContain('회피 성공! 오늘도 학부생으로 살아남았다');
    expect(player().stamina).toBe(100);
  });

  it('resolve_noActive_noop', () => {
    ev().resolve('caught');
    expect(player().stamina).toBe(100);
    expect(texts()).toEqual([]);
  });

  it('trigger_assignment_setsDeadlineAndNotice', () => {
    ev().trigger('assignmentAlert', 0);
    const id = useQuestStore.getState().deadlineQuestId;
    expect(id).not.toBeNull();
    expect(texts().some((t) => t.startsWith('오늘 마감: ') && t.endsWith(' 선배 찾아가기'))).toBe(true);
    expect(ev().active?.id).toBe('assignmentAlert');
  });

  it('trigger_assignment_skipsClearedQuests', () => {
    useQuestStore.setState((s) => ({
      quests: {
        ...s.quests,
        'q1-ee': { ...s.quests['q1-ee'], status: 'cleared' },
        'q2-design': { ...s.quests['q2-design'], status: 'cleared' },
        'q3-math': { ...s.quests['q3-math'], status: 'cleared' },
        'q4-neat': { ...s.quests['q4-neat'], status: 'cleared' },
      },
    }));
    ev().trigger('assignmentAlert', 0);
    expect(useQuestStore.getState().deadlineQuestId).toBe('q5-cse');
    expect(texts()).toContain('오늘 마감: 컴퓨터공학부 선배 찾아가기');
  });

  it('trigger_assignmentAllCleared_noEventButRescheduled', () => {
    useQuestStore.setState((s) => ({
      quests: Object.fromEntries(Object.entries(s.quests).map(([k, v]) => [k, { ...v, status: 'cleared' }])) as typeof s.quests,
    }));
    ev().trigger('assignmentAlert', 0);
    expect(ev().active).toBeNull();
    expect(ev().nextAt).not.toBeNull();
  });

  it('trigger_snack_boothOutsideBuildings', () => {
    ev().trigger('snackEvent', 0);
    const [x, , z] = ev().active!.position!;
    for (const b of BUILDINGS) {
      expect(Math.abs(x - b.x) <= b.w / 2 && Math.abs(z - b.z) <= b.d / 2).toBe(false);
    }
    expect(texts()).toContain('학생회 간식 나눔 행사 중! (60초)');
  });

  it('randomSnackPoint_manySamples_neverInsideBuildings', () => {
    const rng = createRng(123);
    for (let i = 0; i < 300; i++) {
      const [x, , z] = randomSnackPoint(rng);
      for (const b of BUILDINGS) expect(Math.abs(x - b.x) <= b.w / 2 && Math.abs(z - b.z) <= b.d / 2).toBe(false);
    }
  });

  it('resolve_snackReached_staminaFullAndMessage', () => {
    player().addStamina(-70);
    ev().trigger('snackEvent', 0);
    ev().resolve('reached');
    expect(player().stamina).toBe(100);
    expect(texts()).toContain('간식 획득!');
  });

  it('resolve_snackExpired_noReward', () => {
    player().addStamina(-70);
    ev().trigger('snackEvent', 0);
    ev().resolve('expired');
    expect(player().stamina).toBe(30);
  });

  it('trigger_unknownId_noop', () => {
    ev().trigger('nope' as never, 0);
    expect(ev().active).toBeNull();
  });
});

describe('player store stamina', () => {
  beforeEach(() => resetAllStores());

  it('tickStamina_running_drainsAndDepletionNotifiesOnce', () => {
    player().setMoveMode('run');
    for (let t = 0; t < 10; t++) player().tickStamina(1, 1000 + t * 1000);
    expect(player().stamina).toBe(0);
    expect(texts().filter((x) => x === '카페인이 부족합니다…')).toHaveLength(1);
    expect(player().canRun(player().staminaLockedUntil - 1)).toBe(false);
    player().setMoveMode('idle');
    player().tickStamina(1, 20_000);
    expect(player().stamina).toBe(4);
    expect(player().canRun(20_000)).toBe(true);
  });

  it('tickStamina_idleAtMax_noStateChange', () => {
    player().tickStamina(1, 0);
    expect(player().stamina).toBe(100);
  });

  it('drinkCoffee_cooldown_rejectsSecondDrink', () => {
    player().addStamina(-50);
    expect(player().drinkCoffee('cart-west', 1000)).toBe(true);
    expect(player().stamina).toBe(100);
    player().addStamina(-50);
    expect(player().drinkCoffee('cart-west', 5000)).toBe(false);
    expect(player().stamina).toBe(50);
    expect(player().drinkCoffee('cart-east', 5000)).toBe(true);
    expect(player().drinkCoffee('cart-west', 21_000)).toBe(true);
  });

  it('drinkCoffee_afterDepletion_clearsLock', () => {
    player().setMoveMode('run');
    for (let t = 0; t < 10; t++) player().tickStamina(1, 1000 + t * 1000);
    player().drinkCoffee('cart-west', 10_500);
    expect(player().canRun(10_500)).toBe(true);
  });
});
