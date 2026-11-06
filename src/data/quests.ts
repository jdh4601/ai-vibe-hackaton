import type { QuestDef, QuestId } from '../game/types';

// Track E fills all 5 quests.
export const QUESTS: QuestDef[] = [
  {
    id: 'q1-ee',
    order: 1,
    departmentId: 'ee',
    npcId: 'npc-ee',
    title: '볼트를 맞춰라',
    offer: [{ speaker: '납땜 선배', text: '지금 자율주행 배달 로봇을 만들고 있는데, 전압이 안 맞아서 안 움직여. 좀 도와줄래?' }],
    declineLine: '그래, 생각 바뀌면 다시 와!',
    successLines: [{ speaker: '납땜 선배', text: '오, 로봇이 움직인다! 고마워!' }],
    thanksLine: '덕분에 로봇이 잘 달리고 있어!',
    hint: '천천히 돌려 봐. 5V 근처에서 미세하게!',
    minigame: {
      kind: 'dial',
      holdMs: 1000,
      stages: [
        { targetV: 5.0, toleranceV: 0.1, label: '아두이노 5.0V' },
        { targetV: 3.3, toleranceV: 0.1, label: '라이다 센서 3.3V' },
      ],
    },
    skillId: 'skill-ee',
  },
];

export const getQuest = (id: QuestId): QuestDef | undefined => QUESTS.find((q) => q.id === id);
