import type { SkillDef } from '../game/types';

// Track E fills all 20 skills (5 obtainable + 15 Coming Soon).
export const SKILLS: SkillDef[] = [
  {
    id: 'skill-ee',
    departmentId: 'ee',
    emoji: '📡',
    name: '라이다 센서: 거리두기 능력',
    description: '교수님과의 거리를 실시간으로 측정합니다. 회피 확률이 올라간 것 같은 기분이 듭니다.',
    obtainable: true,
  },
];

export const getSkill = (id: string): SkillDef | undefined => SKILLS.find((s) => s.id === id);
