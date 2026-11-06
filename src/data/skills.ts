import type { DepartmentId, SkillDef } from '../game/types';

const skill = (departmentId: DepartmentId, emoji: string, name: string, description: string, obtainable: boolean): SkillDef => ({
  id: `skill-${departmentId}`,
  departmentId,
  emoji,
  name,
  description,
  obtainable,
});

const reserved = (departmentId: DepartmentId, emoji: string, name: string, description: string): SkillDef =>
  skill(departmentId, emoji, name, description, false);

// 5 obtainable skills (quest departments) + 15 reserved "Coming Soon" skills for the dex.
export const SKILLS: SkillDef[] = [
  skill('ee', '📡', '라이다 센서: 거리두기 능력', '교수님과의 거리를 실시간으로 측정합니다. 회피 확률이 올라간 것 같은 기분이 듭니다.', true),
  skill('design', '🎨', '고흐의 미감', '세상이 살짝 더 노랗고 소용돌이쳐 보입니다. 귀는 소중히 하세요.', true),
  skill('math', '📐', '피타고라스의 각도기', '모든 각을 직각으로 봅니다. 인간관계도 직각입니다.', true),
  skill('neat', '🪶', '제갈량의 지략', '회의에서 세 수 앞을 내다봅니다. 팀플 조장 각입니다.', true),
  skill('cse', '🐧', '리누스 토르발스의 손가락', '타자 속도가 빨라진 것 같습니다. 단, 말투가 공격적으로 변합니다.', true),
  reserved('biz', '💼', '워런 버핏의 복리 감각', '용돈이 복리로 불어나는 상상을 합니다. 현실은 아직 제자리입니다.'),
  reserved('gts', '🚢', '장보고의 무역로', '택배가 어디쯤 왔는지 바다 건너에서도 느낍니다.'),
  reserved('tax', '🧾', '1원 단위 집착', '장부의 1원 오차가 눈에 밟혀 잠을 이루지 못합니다.'),
  reserved('media', '🎥', '알고리즘의 간택', '올리는 영상마다 이상하게 조회수가 오릅니다. 아마도요.'),
  reserved('pa', '🏛️', '결재 라인 통찰력', '누구 도장을 먼저 받아야 하는지 한눈에 보입니다.'),
  reserved('consumer', '🛒', '장바구니 심리학', '담아 둔 물건을 끝내 결제하지 않는 절제력이 생깁니다.'),
  reserved('bio', '🧬', 'PCR 증폭술', '작은 아이디어도 수백만 배로 증폭해 줍니다.'),
  reserved('biorobot', '🦾', '아이언맨의 의수', '무거운 짐도 가볍게 듭니다. 하이파이브는 조심하세요.'),
  reserved('ice', '📶', '5G 텔레파시', '와이파이가 약한 곳에서도 친구의 속마음이 잡힙니다.'),
  reserved('energy', '🔋', '무한 동력 체력', '시험 기간에도 배터리가 20%를 유지합니다.'),
  reserved('mech', '⚙️', '에디슨의 손재주', '고장 난 물건 앞에 서면 손이 먼저 움직입니다.'),
  reserved('histedu', '📜', '실록 기억력', '어제 점심 메뉴까지 기록으로 남깁니다.'),
  reserved('engedu', '🗽', '셰익스피어의 혀', '평범한 인사도 왠지 운율이 맞습니다.'),
  reserved('hrd', '🧠', 'HR 독심술', '면접관의 표정만 봐도 합격 여부가 보입니다.'),
  reserved('urban', '🏙️', '심시티 시장 감각', '도시 교통 흐름이 머릿속 시뮬레이션으로 보입니다.'),
];

export const getSkill = (id: string): SkillDef | undefined => SKILLS.find((s) => s.id === id);
