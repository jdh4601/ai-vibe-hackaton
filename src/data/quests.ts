import type { QuestDef, QuestId } from '../game/types';

const DECLINE = '그래, 생각 바뀌면 다시 와!';

export const QUESTS: QuestDef[] = [
  {
    id: 'q1-ee',
    order: 1,
    departmentId: 'ee',
    npcId: 'npc-ee',
    title: '볼트를 맞춰라',
    offer: [{ speaker: '납땜 선배', text: '지금 자율주행 배달 로봇을 만들고 있는데, 전압이 안 맞아서 안 움직여. 좀 도와줄래?' }],
    declineLine: DECLINE,
    successLines: [
      { speaker: '납땜 선배', text: '오, 로봇이 움직인다! 고마워!' },
      { speaker: '납땜 선배', text: '이 감각, 전자공학의 맛이야. 네 손도 만만치 않던데?' },
    ],
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
  {
    id: 'q2-design',
    order: 2,
    departmentId: 'design',
    npcId: 'npc-design',
    title: '컵을 그려라',
    offer: [
      { speaker: '야작 선배', text: '기초제품디자인 과제로 컵 평면도를 그려야 하는데 손이 떨려서… 대신 따라 그려 줄래?' },
    ],
    declineLine: DECLINE,
    successLines: [
      { speaker: '야작 선배', text: '와, 선이 살아 있어! 이 곡선이야, 내가 찾던 게!' },
      { speaker: '야작 선배', text: '크리틱은 살았다. 진짜 고마워!' },
    ],
    thanksLine: '네 덕분에 크리틱 무사 통과했어!',
    hint: '점선을 끊지 말고 천천히 따라가 봐. 손잡이도 잊지 말고!',
    minigame: { kind: 'trace', pathId: 'cup', coverageMin: 0.75, deviationMax: 0.2 },
    skillId: 'skill-design',
  },
  {
    id: 'q3-math',
    order: 3,
    departmentId: 'math',
    npcId: 'npc-math',
    title: '빈칸을 채워라',
    offer: [{ speaker: '증명 선배', text: '해석학 과제 하다가 머리가 터질 것 같아. 기초 문제부터 같이 풀어 줄래?' }],
    declineLine: DECLINE,
    successLines: [
      { speaker: '증명 선배', text: '규칙이 딱 보이네! 증명 끝… 이번엔 진짜야.' },
      { speaker: '증명 선배', text: '자명하다! (이번엔 정말 자명했어.)' },
    ],
    thanksLine: '네가 푼 문제 덕에 과제 제출했어!',
    hint: '옆 숫자끼리 빼 보거나 나눠 봐.',
    minigame: {
      kind: 'fillBlank',
      rounds: [
        { sequence: [3, 7, 11, null, 19], options: [13, 14, 15, 16], answer: 15 },
        { sequence: [2, 6, null, 54, 162], options: [12, 18, 24, 36], answer: 18 },
        { sequence: [81, 27, 9, null, 1], options: [0, 3, 4.5, 6], answer: 3 },
      ],
    },
    skillId: 'skill-math',
  },
  {
    id: 'q4-neat',
    order: 4,
    departmentId: 'neat',
    npcId: 'npc-neat',
    title: '문장을 완성하라',
    offer: [{ speaker: '니하오 동기', text: '중국어 작문 숙제인데 단어 순서가 헷갈려. 같이 맞춰 줄래?' }],
    declineLine: DECLINE,
    successLines: [
      { speaker: '니하오 동기', text: '맞다, 이 순서였지! 시에시에, 정말 고마워!' },
      { speaker: '니하오 동기', text: '다음엔 HSK 6급이다. 같이 가자!' },
    ],
    thanksLine: '시에시에! 덕분에 작문 숙제 끝!',
    hint: "중국어도 영어처럼 '주어-동사-목적어' 순서야.",
    minigame: {
      kind: 'ordering',
      mode: 'word',
      rounds: [
        {
          prompt: '나는 학생입니다.',
          tokens: [
            { id: 'wo', label: '我', sub: 'wǒ' },
            { id: 'shi', label: '是', sub: 'shì' },
            { id: 'xuesheng', label: '学生', sub: 'xuésheng' },
          ],
          answer: ['wo', 'shi', 'xuesheng'],
        },
        {
          prompt: '나는 인천대학교 학생입니다.',
          tokens: [
            { id: 'wo', label: '我', sub: 'wǒ' },
            { id: 'shi', label: '是', sub: 'shì' },
            { id: 'inu', label: '仁川大学', sub: 'Rénchuān dàxué' },
            { id: 'de', label: '的', sub: 'de' },
            { id: 'xuesheng', label: '学生', sub: 'xuésheng' },
          ],
          answer: ['wo', 'shi', 'inu', 'de', 'xuesheng'],
        },
      ],
    },
    skillId: 'skill-neat',
  },
  {
    id: 'q5-cse',
    order: 5,
    departmentId: 'cse',
    npcId: 'npc-cse',
    title: '서버를 살려라',
    offer: [
      { speaker: '서버 지킴이 선배', text: '학교 축제 사이트 서버가 터졌어! 코드 블록 순서가 꼬였는데 바로잡아 줄래?' },
    ],
    declineLine: DECLINE,
    successLines: [
      { speaker: '서버 지킴이 선배', text: '200 OK! 서버가 살아났어!' },
      { speaker: '서버 지킴이 선배', text: '오늘은 새벽 3시까지 안 가도 되겠다. 고마워!' },
    ],
    thanksLine: '서버 안정적이야. 축제 때 놀러 와!',
    hint: '확인부터 하고 꺼내야지. 로그인 안 한 사람한테 데이터 주면 큰일 나.',
    minigame: {
      kind: 'ordering',
      mode: 'code',
      rounds: [
        {
          prompt: '축제 사이트 요청 처리 순서를 맞춰라',
          tokens: [
            { id: 'receive', label: '요청 받기' },
            { id: 'auth', label: '로그인 확인' },
            { id: 'query', label: '데이터베이스에서 축제 정보 조회' },
            { id: 'transform', label: '결과를 화면용으로 변환' },
            { id: 'respond', label: '응답 보내기' },
          ],
          answer: ['receive', 'auth', 'query', 'transform', 'respond'],
        },
      ],
    },
    skillId: 'skill-cse',
  },
];

export const getQuest = (id: QuestId): QuestDef | undefined => QUESTS.find((q) => q.id === id);
