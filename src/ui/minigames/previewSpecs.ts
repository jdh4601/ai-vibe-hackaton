import type { MinigameSpec } from '../../game/types';

// Local specs for ?minigame=... previews (plan 1.10). Track E owns the real ones in data/quests.ts.
export interface PreviewEntry {
  title: string;
  hint: string;
  spec: MinigameSpec;
}

export const PREVIEW_SPECS: Record<string, PreviewEntry> = {
  dial: {
    title: '볼트를 맞춰라',
    hint: '천천히 돌려 봐. 5V 근처에서 미세하게!',
    spec: {
      kind: 'dial',
      holdMs: 1000,
      stages: [
        { targetV: 5.0, toleranceV: 0.1, label: '아두이노 5.0V' },
        { targetV: 3.3, toleranceV: 0.1, label: '라이다 센서 3.3V' },
      ],
    },
  },
  trace: {
    title: '컵을 그려라',
    hint: '점선이 더 굵고 진해졌어요. 천천히 따라 그려 봐요.',
    spec: { kind: 'trace', pathId: 'cup', coverageMin: 0.75, deviationMax: 0.2 },
  },
  fillBlank: {
    title: '빈칸을 채워라',
    hint: '옆 숫자끼리 빼 보거나 나눠 봐.',
    spec: {
      kind: 'fillBlank',
      rounds: [
        { sequence: [3, 7, 11, null, 19], options: [13, 14, 15, 16], answer: 15 },
        { sequence: [2, 6, null, 54, 162], options: [12, 18, 24, 36], answer: 18 },
        { sequence: [81, 27, 9, null, 1], options: [0, 3, 4.5, 6], answer: 3 },
      ],
    },
  },
  'ordering-word': {
    title: '문장을 완성하라',
    hint: "중국어도 영어처럼 '주어-동사-목적어' 순서야.",
    spec: {
      kind: 'ordering',
      mode: 'word',
      rounds: [
        {
          prompt: '나는 학생입니다.',
          tokens: [
            { id: 'w-wo', label: '我', sub: 'wǒ' },
            { id: 'w-shi', label: '是', sub: 'shì' },
            { id: 'w-xs', label: '学生', sub: 'xuésheng' },
          ],
          answer: ['w-wo', 'w-shi', 'w-xs'],
        },
        {
          prompt: '나는 인천대학교 학생입니다.',
          tokens: [
            { id: 'w-wo', label: '我', sub: 'wǒ' },
            { id: 'w-shi', label: '是', sub: 'shì' },
            { id: 'w-inu', label: '仁川大学', sub: 'Rénchuān dàxué' },
            { id: 'w-de', label: '的', sub: 'de' },
            { id: 'w-xs', label: '学生', sub: 'xuésheng' },
          ],
          answer: ['w-wo', 'w-shi', 'w-inu', 'w-de', 'w-xs'],
        },
      ],
    },
  },
  'ordering-code': {
    title: '서버를 살려라',
    hint: '확인부터 하고 꺼내야지. 로그인 안 한 사람한테 데이터 주면 큰일 나.',
    spec: {
      kind: 'ordering',
      mode: 'code',
      rounds: [
        {
          prompt: '요청이 들어왔을 때 서버가 실행하는 순서대로 정렬하세요.',
          tokens: [
            { id: 'c-req', label: '요청 받기' },
            { id: 'c-auth', label: '로그인 확인' },
            { id: 'c-db', label: '데이터베이스에서 축제 정보 조회' },
            { id: 'c-view', label: '결과를 화면용으로 변환' },
            { id: 'c-res', label: '응답 보내기' },
          ],
          answer: ['c-req', 'c-auth', 'c-db', 'c-view', 'c-res'],
        },
      ],
    },
  },
};
