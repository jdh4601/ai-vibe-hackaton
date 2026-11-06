import { BUILDINGS, SPAWN_POINT, ZONES } from '../../src/game/config';
import type { Rect, ZoneId } from '../../src/game/config';
import { DEPARTMENTS } from '../../src/data/departments';
import { EVENTS } from '../../src/data/events';
import { NPCS } from '../../src/data/npcs';
import { QUESTS } from '../../src/data/quests';
import { SKILLS } from '../../src/data/skills';

const inside = (r: Rect, x: number, z: number, margin = 0) =>
  Math.abs(x - r.x) <= r.w / 2 - margin && Math.abs(z - r.z) <= r.d / 2 - margin;

describe('data integrity', () => {
  it('departments_twenty_uniqueIds', () => {
    expect(DEPARTMENTS).toHaveLength(20);
    expect(new Set(DEPARTMENTS.map((d) => d.id)).size).toBe(20);
  });
  it('departments_jacket_validFormat', () => {
    for (const d of DEPARTMENTS) {
      expect(d.jacket.bodyColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(d.jacket.sleeveColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(d.jacket.departmentLine).toBe(d.name);
    }
  });
  it('departments_questSix_matchJacketTable', () => {
    const j = (id: string) => DEPARTMENTS.find((d) => d.id === id)!.jacket;
    expect(j('ee')).toMatchObject({ bodyColor: '#0B6E4F', sleeveColor: '#F2C14E' });
    expect(j('design')).toMatchObject({ bodyColor: '#E94F37', sleeveColor: '#FFFFFF' });
    expect(j('math')).toMatchObject({ bodyColor: '#2B2D6E', sleeveColor: '#F4F4F4' });
    expect(j('neat')).toMatchObject({ bodyColor: '#8C1C13', sleeveColor: '#F2D0A4' });
    expect(j('cse')).toMatchObject({ bodyColor: '#111111', sleeveColor: '#39FF14' });
  });
  it('npcs_twenty_uniqueIdsAndPitch', () => {
    expect(NPCS).toHaveLength(20);
    expect(new Set(NPCS.map((n) => n.id)).size).toBe(20);
    expect(new Set(NPCS.map((n) => n.voicePitch)).size).toBe(20);
  });
  it('npcs_departmentId_existsAndOneNpcPerDepartment', () => {
    const ids = new Set(DEPARTMENTS.map((d) => d.id));
    NPCS.forEach((n) => expect(ids.has(n.departmentId)).toBe(true));
    expect(new Set(NPCS.map((n) => n.departmentId)).size).toBe(20);
  });
  it('npcs_content_barksIntroProps', () => {
    for (const n of NPCS) {
      expect(n.barks.length).toBeGreaterThanOrEqual(3);
      expect(n.intro.length).toBeGreaterThanOrEqual(2);
      expect(n.intro.length).toBeLessThanOrEqual(3);
      expect(n.propKeys.length).toBeGreaterThan(0);
    }
  });
  it('npcs_questNpcs_exactlyFive', () => {
    expect(NPCS.filter((n) => n.questId)).toHaveLength(5);
  });
  it('npcs_position_insideOwnZone', () => {
    for (const n of NPCS) {
      const zoneId = (Object.keys(ZONES) as ZoneId[]).find((z) => ZONES[z].departments.includes(n.departmentId));
      expect(zoneId, n.id).toBeDefined();
      expect(inside(ZONES[zoneId!], n.position[0], n.position[2], 0.5), n.id).toBe(true);
    }
  });
  it('npcs_position_notInsideBuildings', () => {
    for (const n of NPCS) for (const b of BUILDINGS) expect(inside(b, n.position[0], n.position[2], -1), n.id).toBe(false);
  });
  it('npcs_position_atLeastFourMetersApart', () => {
    for (let i = 0; i < NPCS.length; i++)
      for (let j = i + 1; j < NPCS.length; j++) {
        const d = Math.hypot(NPCS[i].position[0] - NPCS[j].position[0], NPCS[i].position[2] - NPCS[j].position[2]);
        expect(d, `${NPCS[i].id}-${NPCS[j].id}`).toBeGreaterThanOrEqual(4);
      }
  });
  it('npcs_firstQuestNpc_aboutTwentySecondsAway', () => {
    const ee = NPCS.find((n) => n.id === 'npc-ee')!;
    const meters = Math.hypot(ee.position[0] - SPAWN_POINT[0], ee.position[2] - SPAWN_POINT[2]);
    expect(meters / 3.5).toBeGreaterThan(15);
    expect(meters / 3.5).toBeLessThan(25);
  });
  it('quests_five_referenceExistingNpcAndSkill', () => {
    expect(QUESTS).toHaveLength(5);
    expect(QUESTS.map((q) => q.order)).toEqual([1, 2, 3, 4, 5]);
    for (const q of QUESTS) {
      const npc = NPCS.find((n) => n.id === q.npcId);
      expect(npc?.questId).toBe(q.id);
      expect(npc?.departmentId).toBe(q.departmentId);
      expect(SKILLS.find((s) => s.id === q.skillId)?.departmentId).toBe(q.departmentId);
      expect(q.offer.at(-1)!.text.endsWith('?')).toBe(true);
      expect(q.successLines.length).toBeGreaterThan(0);
      expect(q.hint.length).toBeGreaterThan(0);
    }
  });
  it('skills_twenty_exactlyFiveObtainable', () => {
    expect(SKILLS).toHaveLength(20);
    expect(new Set(SKILLS.map((s) => s.id)).size).toBe(20);
    expect(SKILLS.filter((s) => s.obtainable).map((s) => s.id).sort()).toEqual(
      QUESTS.map((q) => q.skillId).sort(),
    );
    const ids = new Set(DEPARTMENTS.map((d) => d.id));
    SKILLS.forEach((s) => expect(ids.has(s.departmentId)).toBe(true));
  });
  it('quests_minigameAnswers_insideOptions', () => {
    for (const q of QUESTS) {
      const m = q.minigame;
      if (m.kind === 'fillBlank')
        for (const r of m.rounds) {
          expect(r.options).toContain(r.answer);
          expect(r.sequence.filter((v) => v === null)).toHaveLength(1);
        }
      if (m.kind === 'ordering')
        for (const r of m.rounds) {
          const tokenIds = r.tokens.map((t) => t.id);
          expect(new Set(tokenIds).size).toBe(tokenIds.length);
          expect([...r.answer].sort()).toEqual([...tokenIds].sort());
        }
      if (m.kind === 'dial') expect(m.stages.length).toBeGreaterThan(0);
    }
  });
  it('quests_fillBlankAnswers_followSequenceRule', () => {
    const m = QUESTS.find((q) => q.id === 'q3-math')!.minigame;
    if (m.kind !== 'fillBlank') throw new Error('wrong kind');
    expect(m.rounds.map((r) => r.answer)).toEqual([15, 18, 3]);
  });
  it('quests_wordMode_tokensHavePinyin', () => {
    const m = QUESTS.find((q) => q.id === 'q4-neat')!.minigame;
    if (m.kind !== 'ordering') throw new Error('wrong kind');
    m.rounds.forEach((r) => r.tokens.forEach((t) => expect(t.sub).toBeTruthy()));
  });
  it('events_three_unique', () => {
    expect(EVENTS.map((e) => e.id).sort()).toEqual(['assignmentAlert', 'professorKidnap', 'snackEvent']);
  });
});
