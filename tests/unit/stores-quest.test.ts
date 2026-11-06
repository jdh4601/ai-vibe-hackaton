import { QUESTS } from '../../src/data/quests';
import { useDialogueStore } from '../../src/stores/useDialogueStore';
import { useGameStore } from '../../src/stores/useGameStore';
import { usePlayerStore } from '../../src/stores/usePlayerStore';
import { useQuestStore } from '../../src/stores/useQuestStore';
import { useSkillStore } from '../../src/stores/useSkillStore';
import { devHooks } from '../../src/debug/devHooks';
import { resetAllStores, texts } from './helpers';

const game = () => useGameStore.getState();
const quests = () => useQuestStore.getState();
const dialogue = () => useDialogueStore.getState();

describe('quest + dialogue stores', () => {
  beforeEach(() => {
    resetAllStores();
    game().setPhase('explore');
  });

  it('start_questNpc_buildsIntroOfferAndChoices', () => {
    dialogue().start('npc-ee');
    const s = dialogue().script!;
    expect(game().phase).toBe('dialogue');
    expect(s.lines).toHaveLength(3); // 2 intro + 1 offer
    expect(s.choices?.map((c) => c.id)).toEqual(['accept', 'decline']);
    expect(s.choices?.map((c) => c.label)).toEqual(['도와준다', '다음에']);
    expect(quests().quests['q1-ee'].status).toBe('offered');
  });

  it('start_alreadyInDialogue_ignored', () => {
    dialogue().start('npc-ee');
    dialogue().start('npc-biz');
    expect(dialogue().script?.npcId).toBe('npc-ee');
  });

  it('start_unknownNpc_noop', () => {
    dialogue().start('npc-nobody');
    expect(dialogue().script).toBeNull();
    expect(game().phase).toBe('explore');
  });

  it('start_talkNpc_introPlusClosingLine', () => {
    dialogue().start('npc-biz');
    const lines = dialogue().script!.lines;
    expect(lines.at(-1)?.text).toBe('나중에 우리 과 과제도 도와줘!');
    expect(dialogue().script!.choices).toBeUndefined();
    dialogue().advance();
    dialogue().advance();
    dialogue().advance();
    expect(dialogue().script).toBeNull();
    expect(game().phase).toBe('explore');
  });

  it('start_clearedQuestNpc_onlyThanksLine', () => {
    quests().succeed('q1-ee');
    dialogue().end();
    game().setPhase('explore');
    useSkillStore.getState().reset();
    dialogue().start('npc-ee');
    expect(dialogue().script!.lines).toHaveLength(1);
    expect(dialogue().script!.lines[0].text).toBe(QUESTS[0].thanksLine);
    expect(dialogue().script!.choices).toBeUndefined();
  });

  it('choose_accept_closesDialogueAndOpensMinigame', () => {
    dialogue().start('npc-ee');
    dialogue().choose('accept');
    expect(dialogue().script).toBeNull();
    expect(game().phase).toBe('minigame');
    expect(game().activeQuestId).toBe('q1-ee');
    expect(quests().quests['q1-ee'].status).toBe('inProgress');
  });

  it('choose_decline_showsDeclineLineThenExplore', () => {
    dialogue().start('npc-ee');
    dialogue().choose('decline');
    expect(dialogue().script!.lines[0].text).toBe('그래, 생각 바뀌면 다시 와!');
    expect(game().phase).toBe('dialogue');
    dialogue().advance();
    expect(game().phase).toBe('explore');
    expect(quests().quests['q1-ee'].status).toBe('offered');
  });

  it('choose_withoutQuestScript_noop', () => {
    dialogue().start('npc-biz');
    dialogue().choose('accept');
    expect(game().phase).toBe('dialogue');
  });

  it('decline_direct_returnsToExplore', () => {
    game().setPhase('dialogue');
    quests().decline('q2-design');
    expect(game().phase).toBe('explore');
  });

  it('accept_alreadyCleared_ignored', () => {
    quests().succeed('q1-ee');
    dialogue().end();
    game().setPhase('explore');
    quests().accept('q1-ee');
    expect(game().phase).toBe('explore');
  });

  it('fail_twice_showsHint', () => {
    quests().accept('q1-ee');
    quests().fail('q1-ee');
    quests().fail('q1-ee');
    expect(quests().quests['q1-ee']).toMatchObject({ failCount: 2, hintVisible: true });
  });

  it('abort_inProgress_backToOfferedAndExplore', () => {
    quests().accept('q1-ee');
    quests().abort('q1-ee');
    expect(quests().quests['q1-ee'].status).toBe('offered');
    expect(game().activeQuestId).toBeNull();
    expect(game().phase).toBe('explore');
  });

  it('succeed_flow_successLinesThenSkillAcquired', () => {
    quests().accept('q1-ee');
    quests().succeed('q1-ee');
    expect(game().activeQuestId).toBeNull();
    expect(game().phase).toBe('dialogue');
    expect(dialogue().script!.lines).toEqual(QUESTS[0].successLines);
    expect(useSkillStore.getState().acquired).toEqual([]);
    QUESTS[0].successLines.forEach(() => dialogue().advance());
    expect(useSkillStore.getState().acquired).toEqual(['skill-ee']);
    expect(game().phase).toBe('skillAcquired');
  });

  it('succeed_twice_secondIgnored', () => {
    quests().succeed('q1-ee');
    dialogue().end();
    const before = useSkillStore.getState().acquired;
    quests().succeed('q1-ee');
    expect(dialogue().script).toBeNull();
    expect(useSkillStore.getState().acquired).toBe(before);
  });

  it('succeed_deadlineQuest_deadlineCleared', () => {
    quests().setDeadline('q1-ee');
    quests().succeed('q1-ee');
    expect(quests().deadlineQuestId).toBeNull();
    quests().setDeadline('q2-design');
    quests().succeed('q1-ee');
    expect(quests().deadlineQuestId).toBe('q2-design');
  });

  it('succeed_fifthQuest_unlocksEndingWithNotice', () => {
    for (const q of QUESTS) {
      quests().succeed(q.id);
      dialogue().end(); // runs onEnd → grant + skillAcquired
    }
    expect(quests().endingUnlocked).toBe(true);
    expect(useSkillStore.getState().acquired).toHaveLength(5);
    expect(texts()).toContain('모든 학과 체험을 마쳤습니다. 광장 중앙 분수대로 가세요.');
  });

  it('play_duringExplore_setsDialoguePhase', () => {
    dialogue().play({ voicePitch: 200, lines: [{ speaker: 'a', text: 'b' }] });
    expect(game().phase).toBe('dialogue');
  });

  it('end_onEndChangesPhase_notOverridden', () => {
    game().setPhase('dialogue');
    dialogue().play({ voicePitch: 200, lines: [{ speaker: 'a', text: 'b' }], onEnd: () => game().setPhase('credits') });
    dialogue().advance();
    expect(game().phase).toBe('credits');
  });

  it('advance_lastLineWithChoices_staysOpen', () => {
    dialogue().start('npc-ee');
    for (let i = 0; i < 5; i++) dialogue().advance();
    expect(dialogue().script).not.toBeNull();
    expect(dialogue().index).toBe(2);
  });

  it('advance_noScript_noop', () => {
    dialogue().advance();
    expect(dialogue().index).toBe(0);
  });
});

describe('dev hooks', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('skipOpening_setsExplore', () => {
    devHooks.skipOpening();
    expect(devHooks.getState().phase).toBe('explore');
  });

  it('teleportToNextQuest_firstQuest_targetsFrontOfEeNpc', () => {
    devHooks.teleportToNextQuest();
    const t = usePlayerStore.getState().teleportTarget!;
    expect(Math.hypot(t[0] - 16, t[2] + 18)).toBeCloseTo(2.5, 5);
  });

  it('teleportToNextQuest_afterFirstCleared_targetsDesignNpc', () => {
    quests().succeed('q1-ee');
    dialogue().end();
    devHooks.teleportToNextQuest();
    const t = usePlayerStore.getState().teleportTarget!;
    expect(Math.hypot(t[0] - 38, t[2] - 10)).toBeCloseTo(2.5, 5);
  });

  it('teleportToNextQuest_allCleared_noop', () => {
    devHooks.grantAllSkills();
    usePlayerStore.getState().clearTeleport();
    devHooks.teleportToNextQuest();
    expect(usePlayerStore.getState().teleportTarget).toBeNull();
  });

  it('teleportTo_position_requested', () => {
    devHooks.teleportTo([1, 2, 3]);
    expect(usePlayerStore.getState().teleportTarget).toEqual([1, 2, 3]);
  });

  it('solveMinigame_noActiveQuest_noop', () => {
    devHooks.solveMinigame();
    expect(game().phase).toBe('opening');
  });

  it('solveMinigame_activeQuest_clearsIt', () => {
    game().setPhase('explore');
    quests().accept('q1-ee');
    devHooks.solveMinigame();
    expect(quests().quests['q1-ee'].status).toBe('cleared');
  });

  it('grantAllSkills_all_marksClearedAndUnlocksEnding', () => {
    devHooks.grantAllSkills();
    const s = devHooks.getState();
    expect(s.skills).toHaveLength(5);
    expect(s.endingUnlocked).toBe(true);
    expect(Object.values(s.quests).every((q) => q.status === 'cleared')).toBe(true);
    expect(texts()).toContain('모든 학과 체험을 마쳤습니다. 광장 중앙 분수대로 가세요.');
    devHooks.grantAllSkills(); // idempotent, no second notice
    expect(texts().filter((t) => t.startsWith('모든 학과'))).toHaveLength(1);
  });

  it('triggerEvent_snack_setsActive', () => {
    devHooks.triggerEvent('snackEvent');
    expect(devHooks.getState().activeEvent).toBe('snackEvent');
  });
});
