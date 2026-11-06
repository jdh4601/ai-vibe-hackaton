import type { DepartmentId, DialogueLine, NpcDef, QuestId } from '../game/types';

// Positions are chosen inside config.ZONES (x/z), at least 4 m apart, clear of BUILDINGS.
// Q1 (ee) is ~68 m from SPAWN_POINT, about a 20 s walk.

interface NpcSeed {
  id: DepartmentId;
  name: string;
  x: number;
  z: number;
  rotationY: number;
  propKeys: string[];
  voicePitch: number;
  barks: string[];
  intro: string[];
  questId?: QuestId;
}

const build = (s: NpcSeed): NpcDef => ({
  id: `npc-${s.id}`,
  departmentId: s.id,
  displayName: s.name,
  position: [s.x, 0, s.z],
  rotationY: s.rotationY,
  modelKey: 'student',
  propKeys: s.propKeys,
  voicePitch: s.voicePitch,
  barks: s.barks,
  intro: s.intro.map((text): DialogueLine => ({ speaker: s.name, text })),
  ...(s.questId ? { questId: s.questId } : {}),
});

const SEEDS: NpcSeed[] = [
  // ---- quest NPCs ----
  {
    id: 'ee', name: '납땜 선배', x: 16, z: -18, rotationY: 0.3, questId: 'q1-ee',
    propKeys: ['breadboard', 'deliveryRobot'], voicePitch: 220,
    barks: ['아 또 쇼트났네…', '멀티미터 누가 가져갔냐', '로봇이 벽이랑 사랑에 빠졌어'],
    intro: [
      "전자공학부는 회로부터 반도체, 임베디드 시스템까지 '전기가 흐르는 모든 것'을 다뤄.",
      '나는 임베디드 트랙인데, 작은 컴퓨터를 로봇이나 기계에 심는 걸 배워.',
    ],
  },
  {
    id: 'design', name: '야작 선배', x: 38, z: 10, rotationY: -0.4, questId: 'q2-design',
    propKeys: ['easel', 'paperCups'], voicePitch: 250,
    barks: ['오늘도 야작각이네…', '크리틱 내일인데 아직 러프도 안 나옴', '이 곡선… 이 곡선이 아니야'],
    intro: [
      '디자인학부에서는 시각, 제품, 영상 디자인을 배워.',
      '제품 디자인은 사람이 손에 쥐는 물건의 형태를 설계하는 일이야. 평면도부터 시작하지.',
    ],
  },
  {
    id: 'math', name: '증명 선배', x: -42, z: 8, rotationY: 0.5, questId: 'q3-math',
    propKeys: ['chalkboard', 'crumpledPapers'], voicePitch: 190,
    barks: ['증명 끝… 아 아니네', '자명하다(자명하지 않음)', '엡실론이 0보다 크다고 하자…'],
    intro: [
      '수학과는 공식을 외우는 곳이 아니라 왜 성립하는지 증명하는 곳이야.',
      '규칙을 찾고, 그 규칙이 항상 맞는지 따지는 게 우리 일이지.',
    ],
  },
  {
    id: 'neat', name: '니하오 동기', x: -16, z: -20, rotationY: -0.2, questId: 'q4-neat',
    propKeys: ['wordCards', 'studySign'], voicePitch: 280,
    barks: ['니하오… 아니 이거 성조 맞나?', 'HSK 5급까지 D-30', '상하이 교환학생 가고 싶다'],
    intro: [
      '동북아국제통상학부는 중국·일본과의 무역과 비즈니스를 배우는 곳이야. 인천대 시그니처 학과지!',
      '통상 공부랑 중국어를 같이 해야 해서 매일 단어랑 싸우는 중이야.',
    ],
  },
  {
    id: 'cse', name: '서버 지킴이 선배', x: 38, z: -20, rotationY: 0.2, questId: 'q5-cse',
    propKeys: ['serverRack', 'laptop'], voicePitch: 170,
    barks: ['서버 또 터졌네…', 'push --force 누가 했냐', '제 컴퓨터에선 잘 되는데요?'],
    intro: [
      '컴퓨터공학부는 소프트웨어, AI, 시스템을 배워. 요즘 제일 핫하지.',
      '근데 현실은 새벽 3시에 서버 살리는 사람들이야.',
    ],
  },
  // ---- talk NPCs: humanities / business zone ----
  {
    id: 'biz', name: '팀플 조장 선배', x: -40, z: -20, rotationY: 0.4,
    propKeys: ['laptop', 'slides'], voicePitch: 200,
    barks: ['팀플 무임승차 신고합니다', 'PPT 폰트 통일 좀 해줘', '마케팅 4P가 뭐였더라…'],
    intro: [
      '경영학부는 회사를 어떻게 굴리는지, 돈과 사람과 전략을 배우는 곳이야.',
      '마케팅, 회계, 인사까지 다 건드려서 팀플이 엄청 많아.',
    ],
  },
  {
    id: 'gts', name: '무역 선배', x: -28, z: -24, rotationY: -0.3,
    propKeys: ['container', 'papers'], voicePitch: 235,
    barks: ['송도항 컨테이너 몇 개 들어왔지?', '인코텀즈 또 헷갈려', '관세율 표 어디 갔어'],
    intro: [
      'Global Trade & Service학부는 국제 무역과 서비스 산업을 영어로 배우는 곳이야.',
      '송도 바로 옆이 항만이라 현장 이야기를 듣기 좋아.',
    ],
  },
  {
    id: 'tax', name: '계산기 선배', x: -14, z: -32, rotationY: 0.1,
    propKeys: ['calculator', 'ledger'], voicePitch: 300,
    barks: ['차변 대변… 대변이 안 맞아', '1원 차이가 안 풀려', '부가세 신고 기간이다…'],
    intro: [
      '세무회계학과는 회계 장부와 세금 제도를 배워서 세무사, 회계사를 준비해.',
      '숫자가 딱 맞아떨어질 때의 쾌감이 있어.',
    ],
  },
  {
    id: 'media', name: '브이로그 선배', x: -26, z: -36, rotationY: -0.5,
    propKeys: ['tripod', 'camera'], voicePitch: 265,
    barks: ['오늘 브이로그 각이다', '컷! 한 번만 더 갈게요', '조명이 너무 쎄다'],
    intro: [
      '미디어커뮤니케이션학과는 영상, 방송, 뉴미디어 콘텐츠를 기획하고 만드는 곳이야.',
      '촬영하고 편집하고 분석하는 걸 다 배워.',
    ],
  },
  {
    id: 'pa', name: '공문 선배', x: -38, z: -32, rotationY: 0.6,
    propKeys: ['papers', 'folders'], voicePitch: 185,
    barks: ['공문 양식이 또 바뀌었대', '결재 올렸는데 반려됐어', '이 서류는 3부 복사요'],
    intro: [
      '행정학과는 정부와 공공기관이 어떻게 일하는지 배우는 곳이야.',
      '공무원 시험을 준비하는 사람도 많고, 정책을 분석하는 공부도 해.',
    ],
  },
  {
    id: 'consumer', name: '설문 선배', x: -44, z: -26, rotationY: 0.9,
    propKeys: ['clipboard', 'poster'], voicePitch: 320,
    barks: ['설문 하나만 해 주실 수 있나요?', '5점 척도로 답해 주세요', '이거 소비자 심리 실험이에요'],
    intro: [
      '소비자학과는 사람들이 왜 사고 어떻게 고르는지, 소비자 권리를 지키는 법을 배워.',
      '설문 조사와 데이터 분석을 정말 많이 해.',
    ],
  },
  // ---- talk NPCs: engineering zone ----
  {
    id: 'bio', name: '피펫 선배', x: 44, z: -26, rotationY: -0.8,
    propKeys: ['pipette', 'labCoat'], voicePitch: 215,
    barks: ['세포 배양 시간 맞춰야 해', '오염됐네… 다시 해야 돼', '이 젤 밴드가 왜 흐릿하지'],
    intro: [
      '생명공학부는 DNA와 세포, 단백질을 다루면서 의약과 바이오 산업을 공부하는 곳이야.',
      '실험복 입고 실험실에 사는 시간이 길지만 결과 나올 때 짜릿해.',
    ],
  },
  {
    id: 'biorobot', name: '로봇팔 선배', x: 38, z: -32, rotationY: 0.2,
    propKeys: ['robotArm', 'controller'], voicePitch: 160,
    barks: ['로봇팔이 또 나한테 하이파이브했어', '캘리브레이션 다시 해야 돼', '서보 모터에서 탄내 나는데?'],
    intro: [
      '바이오-로봇시스템공학과는 로봇 기술과 생체 공학을 합쳐서 배우는 곳이야.',
      '수술 로봇이나 재활 로봇 같은 걸 만들어 보는 거지.',
    ],
  },
  {
    id: 'ice', name: '와이파이 선배', x: 27, z: -24, rotationY: -0.1,
    propKeys: ['antenna', 'router'], voicePitch: 290,
    barks: ['와이파이 왜 이렇게 느려', '신호 세기가 -90dBm이래', '5G 기지국이 보고 싶다'],
    intro: [
      '정보통신공학과는 통신 네트워크와 신호 처리, 사물인터넷을 배우는 곳이야.',
      '우리가 쓰는 스마트폰이 어떻게 연결되는지 원리부터 파고들어.',
    ],
  },
  {
    id: 'energy', name: '배터리 선배', x: 14, z: -30, rotationY: 0.5,
    propKeys: ['battery', 'beaker'], voicePitch: 245,
    barks: ['배터리 셀 하나만 더…', '전해질 비율이 문제였네', '충전 사이클 500번 돌리는 중'],
    intro: [
      '에너지화학공학과는 배터리, 수소, 태양전지 같은 미래 에너지를 화학으로 다루는 곳이야.',
      '전기차 시대에 가장 주목받는 분야 중 하나지.',
    ],
  },
  {
    id: 'mech', name: '톱니바퀴 선배', x: 26, z: -36, rotationY: -0.6,
    propKeys: ['gear', 'tools'], voicePitch: 150,
    barks: ['도면 한 장만 더 그리면 끝', '공차가 0.01mm 어긋났어', '이 부품 3D 프린터로 뽑자'],
    intro: [
      '기계공학과는 자동차, 로봇, 항공기처럼 움직이는 모든 기계의 원리를 배워.',
      '설계하고 해석하고 직접 만들어 보는 게 핵심이야.',
    ],
  },
  // ---- talk NPCs: education zone ----
  {
    id: 'histedu', name: '사료 선배', x: -30, z: 12, rotationY: 0.3,
    propKeys: ['oldMap', 'scrolls'], voicePitch: 175,
    barks: ['이건 1차 사료가 아니야', '조선왕조실록 몇 권이더라', '연표 외우다 눈 감김'],
    intro: [
      '역사교육과는 역사를 깊이 공부하고 학생들에게 가르치는 교사를 길러내는 곳이야.',
      '사료를 읽고 해석하는 훈련을 많이 해.',
    ],
  },
  {
    id: 'engedu', name: '임용 준비 선배', x: -44, z: 19, rotationY: 0.7,
    propKeys: ['vocabBook', 'calendar'], voicePitch: 310,
    barks: ['임용까지 D-300', 'Shakespeare가 뭐라고 했더라', '교육학 논술 연습 중'],
    intro: [
      '영어교육과는 영어를 잘하는 것에 더해 영어를 어떻게 가르칠지 배우는 곳이야.',
      '교직 이수와 임용시험 준비를 같이 해서 바쁘지만 보람 있어.',
    ],
  },
  {
    id: 'hrd', name: '아이스브레이커 선배', x: -20, z: 20, rotationY: -0.4,
    propKeys: ['postits', 'board'], voicePitch: 270,
    barks: ['아이스브레이킹 한 판 할까요?', '포스트잇에 아이디어 붙여 주세요', '워크숍 퍼실리테이션 연습 중'],
    intro: [
      '창의인재개발학과는 사람의 잠재력을 키우는 교육과 조직 개발을 배우는 곳이야.',
      '기업 교육, 상담, 퍼실리테이션처럼 사람을 돕는 일을 공부해.',
    ],
  },
  // ---- talk NPC: arts & urban zone ----
  {
    id: 'urban', name: '시뮬레이션 선배', x: 24, z: 20, rotationY: -0.3,
    propKeys: ['drone', 'parcelBox'], voicePitch: 230,
    barks: ['송도 교통 시뮬레이션 돌리는 중', '드론 배터리가 3분 남았어', '택배 박스가 왜 또 여기 있지'],
    intro: [
      '도시행정학과는 도시를 어떻게 계획하고 운영할지 배우고, 스마트 물류 같은 신기술도 다뤄.',
      '송도처럼 계획 도시가 곧 우리 교과서야.',
    ],
  },
];

export const TALK_CLOSING_LINE = '나중에 우리 과 과제도 도와줘!';

export const NPCS: NpcDef[] = SEEDS.map(build);

export const getNpc = (id: string): NpcDef | undefined => NPCS.find((n) => n.id === id);
