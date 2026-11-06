import type { NpcDef } from '../game/types';

// Track E fills all 20 NPCs (positions inside config.ZONES).
export const NPCS: NpcDef[] = [
  {
    id: 'npc-ee',
    departmentId: 'ee',
    displayName: '납땜 선배',
    position: [16, 0, -18],
    rotationY: 0,
    modelKey: 'student',
    propKeys: ['breadboard', 'deliveryRobot'],
    voicePitch: 220,
    barks: ['아 또 쇼트났네…', '멀티미터 누가 가져갔냐', '로봇이 벽이랑 사랑에 빠졌어'],
    intro: [
      { speaker: '납땜 선배', text: "전자공학부는 회로부터 반도체, 임베디드 시스템까지 '전기가 흐르는 모든 것'을 다뤄." },
      { speaker: '납땜 선배', text: '나는 임베디드 트랙인데, 작은 컴퓨터를 로봇이나 기계에 심는 걸 배워.' },
    ],
    questId: 'q1-ee',
  },
];

export const getNpc = (id: string): NpcDef | undefined => NPCS.find((n) => n.id === id);
