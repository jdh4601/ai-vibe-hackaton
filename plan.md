# 새내기 오디세이: 나의 학과를 찾아서 (가제)

> AI로 다시 쓰는 대학생활 해커톤 · 2026-11-06
> 문서 구성: Part 1 PRD → Part 2 단계별 구현 계획 → Part 3 멀티 에이전트 작업 계획 → Part 4 테스트 계획 → Part 5 리스크와 컷라인 → Part 6 시연 시나리오

---

# Part 1. PRD

## 1.1 한 줄 요약

인천대 자유전공학부 27학번 새내기가 학교 광장을 돌아다니며 학과 선배들의 과제를 도와주고, 학과 스킬을 도감에 모은 뒤, 마지막에 자신의 전공을 직접 골라 그 학과의 과잠을 받는 3인칭 3D 웹 오픈월드 게임이다.

## 1.2 문제 정의 (심사 기준: 학교 문제 해결성)

- 자유전공학부 학생은 1학년 동안 전공을 골라야 하지만, 학과 정보는 커리큘럼 표와 홈페이지 문구 수준에 머문다.
- "그 학과에서 실제로 무엇을 하는지"를 체험할 기회가 거의 없어서 학생들은 입결과 취업률만 보고 전공을 고른다.
- 이 게임은 각 학과에서 실제로 배우는 내용을 쉬운 미니게임으로 바꿔서 5분 안에 "해 보니 재밌다/아니다"를 느끼게 한다.

## 1.3 타깃 사용자

| 사용자 | 상황 | 이 게임에서 얻는 것 |
|---|---|---|
| 자유전공학부 1학년 | 전공 선택을 앞두고 막막함 | 학과별 실제 과제를 가볍게 체험 |
| 예비 입학생(고3) | 학과 이름만 알고 내용은 모름 | 학과 분위기, 학과 고증 대사 |
| 심사위원(교수진) | 3분 시연으로 평가 | 완성도, 창의성, AI 활용, 학교 문제 해결성 |

## 1.4 심사 기준 매핑

| 심사 기준 | 이 프로젝트의 대응 |
|---|---|
| 창의력 | 학과 탐색을 오픈월드 RPG + 포켓몬 도감 구조로 재해석, 병맛 스킬 이름, 랜덤 돌발상황(교수님의 대학원 납치) |
| AI 활용 | Claude Code 멀티 에이전트로 게임 전체 구현, 학과 대사·퀘스트 콘텐츠 AI 생성, 트레일러 영상 AI 제작(Higgsfield) |
| 완성도 | 오프닝 → 퀘스트 5개 → 과잠 엔딩까지 끊김 없는 플레이, 자동화 테스트 통과, Vercel 배포 URL |
| 학교 문제 해결성 | 자유전공학부 전공 탐색 문제를 직접 겨냥하고, 실제 커리큘럼 기반 과제로 미니게임 구성 |

## 1.5 벤치마크: 포켓몬 레전즈 Z-A에서 가져올 것

| Z-A 요소 | 우리 게임 적용 |
|---|---|
| 캐릭터 뒷모습 3인칭 카메라 | 주인공 뒤 어깨 높이 카메라, 마우스로 회전 |
| 왼쪽 위 원형 미니맵 + 방향 표시 | 왼쪽 위 원형 미니맵, 테두리에 스태미나 링 |
| 도시 광장 + 거리의 NPC | 인천대 12호관 앞 광장 + 학과 NPC 20명 |
| NPC 머리 위 `!` 표시 | 퀘스트 NPC 머리 위 말풍선(학과 고증 대사)과 `!` 아이콘 |
| 하단 대화창 (이름 탭 + 본문 + ▼) | 동일 레이아웃, 타이핑 효과 + 띠리리 비프음 |
| 밝고 따뜻한 조명, 부드러운 그림자 | 맑은 낮 하늘, 따뜻한 직사광, 소프트 섀도, 원경 바다 |

## 1.6 세계관과 스토리

- 무대: 인천대 송도캠퍼스 12호관 앞 광장을 모티브로 한 가상의 광장이다. 붉은 벽돌 지그재그 포장 바닥, 가운데 잔디밭과 소나무, 대각선 산책로, 물결 모양 금속 벤치 조형물, 지하 계단 캐노피, 멀리 보이는 바다와 LNG 탱크를 재현한다.
- 주인공: 자유전공학부 27학번 새내기. 처음부터 끝까지 **자유전공학부 27학번 과잠**을 입고 다닌다.
- 동기: "나는 뭘 좋아하지?" 학과 사람들을 만나 과제를 도와주며 답을 찾는다.
- 결말: 5개 학과 체험을 모두 마치면 주인공이 직접 전공을 고르고, 그 학과 선배가 **새 과잠을 입혀 주는 장면**으로 끝난다.

## 1.7 핵심 게임 루프

```
광장 탐색 → NPC 접근(말풍선) → 대화(학과 소개) → "도와줄래?" Yes/No
   ↑                                                    │ Yes
   │                                                    ▼
스킬 목록 갱신 ← 스킬 획득 연출 ← 클리어 ← 미니게임(드래그 위주)
   │
   └─ 5개 스킬 모두 획득 → 엔딩: 전공 선택 → 과잠 수여식 → 크레딧
```

이 루프 위에 두 개의 보조 시스템이 얹힌다.
- 스태미나: 달리면 줄고, 커피 카트와 간식 나눔 행사에서 회복한다.
- 랜덤 돌발상황: 탐색 중에 45~90초 간격으로 오른쪽 위 알림과 함께 발생한다.

## 1.8 기능 요구사항

### FR-1 오프닝
- FR-1.1 검은 화면에서 알람 소리와 함께 "…눈을 떴다." 문구가 나타난다.
- FR-1.2 휴대폰 UI에 문자 알림 "[인천대학교] 2027학년도 합격자 안내"가 뜨고, 클릭하면 열린다.
- FR-1.3 풀스크린 합격 통지서를 보여 준다. 문구: "인천대학교 자유전공학부 27학번 입학을 축하합니다." 학교 로고 대신 가상 엠블럼을 쓴다.
- FR-1.4 독백 2~3줄("근데… 나는 뭘 좋아하지?")을 보여 준 뒤 [문을 연다] 버튼을 노출한다.
- FR-1.5 버튼을 누르면 흰색 플래시와 함께 광장 상공에서 주인공 뒤로 내려오는 카메라 연출(약 3초)이 재생된다.
- FR-1.6 조작 안내 토스트를 보여 준다: `WASD 이동 · Shift 달리기 · 마우스 시점 · E/클릭 대화 · Tab 도감`.
- FR-1.7 오프닝 전체는 [건너뛰기] 버튼과 디버그 키로 생략할 수 있다.

### FR-2 월드와 이동
- FR-2.1 약 120m × 120m 광장 맵을 만들고, 보이지 않는 벽으로 경계를 막는다.
- FR-2.2 주인공은 WASD로 걷고 Shift로 달린다. 걷기/달리기/정지 애니메이션이 전환된다.
- FR-2.3 카메라는 3인칭 뒷모습 시점이며 마우스로 회전한다. 건물과 충돌하면 카메라가 앞으로 당겨진다.
- FR-2.4 건물, 나무, 조형물, NPC와 물리 충돌한다.
- FR-2.5 주인공은 자유전공학부 27학번 과잠(남색 몸판 + 흰색 소매, 등판 "INU 자유전공학부 27")을 입고 있다.

### FR-3 NPC와 대화
- FR-3.1 NPC 20명을 광장에 배치한다. 퀘스트 NPC 5명, 대화 NPC 15명이다.
- FR-3.2 각 NPC는 학과를 상징하는 소품과 함께 고유 행동(납땜, 스케치, 계산기 두드리기 등)을 하고 있다.
- FR-3.3 주인공이 반경 6m 안에 들어오면 머리 위에 학과 고증 말풍선이 뜬다. 대사는 NPC별 3개 이상 중에서 무작위로 바뀐다.
- FR-3.4 반경 3m 안에서 E 키를 누르거나 말풍선을 클릭하면 대화가 시작된다. 대화 중에는 이동 입력을 막고 카메라가 NPC 쪽으로 돌아간다.
- FR-3.5 대화창은 Z-A 스타일 하단 박스(이름 탭 + 본문 + ▼)이다. 글자가 한 자씩 찍히고, 글자마다 NPC 고유 음높이의 비프음이 난다. 클릭/Space로 다음 줄로 넘어가거나 타이핑을 즉시 완료한다.
- FR-3.6 퀘스트 NPC 대화 순서: 학과 소개(2~3줄) → 과제 제안 "~하는데 도와줄래?" → [도와준다]/[다음에] 선택.
- FR-3.7 [다음에]를 고르면 "그래, 생각 바뀌면 다시 와!"를 보여 주고 탐색으로 돌아간다. 퀘스트 상태는 `offered`로 남는다.
- FR-3.8 이미 클리어한 NPC에게 말을 걸면 감사 대사 1줄만 나온다.

### FR-4 미니게임 퀘스트 (5개, 구현 순서대로)
- FR-4.1 [도와준다]를 누르면 화면 중앙 모달로 미니게임이 열리고 3D 월드는 일시정지한다. 포인터 잠금을 해제한다.
- FR-4.2 모든 미니게임은 마우스 드래그나 클릭만으로 풀 수 있다. 텍스트 입력은 없다.
- FR-4.3 실패해도 무제한 재시도할 수 있다. 2회 실패하면 힌트를 보여 준다.
- FR-4.4 성공하면 NPC 감사 대사 → 스킬 획득 연출(FR-5)로 이어진다.
- FR-4.5 미니게임 우측 상단에 [포기] 버튼을 두며, 포기하면 퀘스트가 `offered` 상태로 돌아간다.
- 퀘스트 상세는 1.10절을 따른다.

### FR-5 스킬과 도감
- FR-5.1 스킬 획득 연출: 화면 어두워짐 → 이모지 아이콘이 커지며 회전 → "{스킬명}을(를) 획득했습니다!" → 설명 1줄 → 팡파르 효과음. 약 3초 후 또는 클릭으로 닫힌다.
- FR-5.2 획득한 스킬은 미니맵 아래 스킬 목록에 `이모지 + 스킬명`으로 추가되고, 새 항목은 1초간 반짝인다.
- FR-5.3 Tab 키로 도감 화면을 연다. 20칸 그리드에 획득한 스킬 5칸은 컬러, 미획득 퀘스트 스킬은 실루엣 + "???", 대화 NPC 15칸은 "Coming Soon" 잠금 표시로 보여 준다.
- FR-5.4 스킬은 연출 전용이며 게임 수치에 영향을 주지 않는다.

### FR-6 HUD (스케치 배치 그대로)
- FR-6.1 왼쪽 위: 원형 미니맵(지름 180px). 맵을 위에서 본 SVG 위에 주인공 화살표, 퀘스트 NPC `!`, 커피 카트 ☕, 이벤트 마커를 표시한다. 미니맵은 주인공 방향에 맞춰 회전하고 N 표시가 따라 돈다.
- FR-6.2 미니맵 테두리: 스태미나 링(초록 → 노랑 → 빨강).
- FR-6.3 왼쪽, 미니맵 아래: 스킬 목록.
- FR-6.4 오른쪽 위: 퀘스트 트래커 "학과 체험 n/5"와 현재 진행 중인 퀘스트명.
- FR-6.5 오른쪽 위, 퀘스트 트래커 아래: 알림 스택(최대 3개, 5초 후 사라짐). 돌발상황과 학과 안내가 여기에 뜬다.

### FR-7 스태미나와 커피
- FR-7.1 스태미나 최대치는 100이다. 달리기 중 초당 12 감소, 정지 중 초당 4 회복, 걷기 중에는 변화가 없다.
- FR-7.2 스태미나가 0이 되면 3초간 달리기가 막히고 "카페인이 부족합니다…" 알림이 뜬다.
- FR-7.3 커피 카트 2곳에서 E를 누르면 "아아 한 잔 수혈!" 대사와 함께 스태미나가 100으로 회복된다. 카트별로 20초 쿨다운이 있다.

### FR-8 랜덤 돌발상황
- FR-8.1 탐색 상태(대화·미니게임·연출 중 제외)에서만 45~90초 간격으로 발생한다. 같은 이벤트는 연속으로 나오지 않는다.
- FR-8.2 이벤트 3종:

| 이벤트 | 연출 | 결과 |
|---|---|---|
| 🎓 교수님의 대학원 납치 | 알림 "교수님이 다가옵니다! 도망치세요!" → 교수 NPC가 주인공 근처에 나타나 8초간 쫓아옴 | 붙잡히면 화면 페이드 + "대학원 진학 권유를 30분간 들었습니다…" 후 스태미나 -40 / 도망치면 "회피 성공! 오늘도 학부생으로 살아남았다" |
| 📢 동기의 과제 통보 | 동기 NPC가 다가와 "야 너 그거 과제 했어? 오늘까지래!" | 아직 안 깬 퀘스트 NPC 하나를 퀘스트 트래커에 "오늘 마감: {학과} 선배 찾아가기"로 띄우고 미니맵에 깜빡이는 마커 표시(길 안내 역할) |
| 🍪 간식 나눔 행사 | 알림 "학생회 간식 나눔 행사 중! (60초)" | 광장 임의 지점에 간식 부스가 생기고 미니맵에 표시, 도착하면 스태미나 100 + "간식 획득!" |

- FR-8.3 디버그 키로 각 이벤트를 즉시 발생시킬 수 있다.

### FR-9 엔딩: 과잠 수여식
- FR-9.1 다섯 번째 스킬을 획득하면 알림 "모든 학과 체험을 마쳤습니다. 광장 중앙 분수대로 가세요."가 뜨고 미니맵에 ★ 마커가 생긴다.
- FR-9.2 ★ 지점에 도착하면 엔딩 컷신이 시작된다. 퀘스트 NPC 5명이 주인공 주위에 반원으로 모인다.
- FR-9.3 전공 선택 화면: 획득한 스킬 5개를 학과 카드(학과명, 이모지, 스킬명, 체험한 과제 한 줄, 과잠 미리보기 색)로 보여 준다. 독백 "어떤 시간이 제일 재밌었지?"
- FR-9.4 카드를 고르면 확인 대화 "{학과}로 정할래?" [결정!] / [다시 생각해볼래]
- FR-9.5 과잠 수여 연출 (약 12초):
  1. 카메라가 주인공 정면으로 돌아 들어간다.
  2. 선택한 학과 NPC가 앞으로 나와 "우리 과에 온 걸 환영해!"라고 말한다.
  3. 선배가 과잠을 건네는 동작 → 화면 흰색 플래시.
  4. 주인공의 과잠이 해당 학과 색상과 등판 문구 "INU {학과명} 27"로 바뀐다.
  5. 카메라가 천천히 주인공 등 뒤로 돌아가 등판 문구를 크게 보여 준다. 꽃가루 파티클과 엔딩 BGM이 재생된다.
  6. 화면 하단 문구: "나의 학과를 찾았다."
- FR-9.6 크레딧: 학과 상징물(톱니바퀴, 비커, 붓, 각도기 등)이 하나씩 지나가며 팀원 이름과 "Made with Claude Code" 문구를 보여 준다. 마지막에 [처음부터] 버튼.

### FR-10 사운드
- 광장 BGM(밝은 루프), 엔딩 BGM, 효과음(대화 비프, 선택, 성공, 실패, 스킬 팡파르, 알림, 커피), 모두 CC0 또는 Web Audio 합성으로 마련한다.
- 오른쪽 아래 음소거 토글을 둔다. 브라우저 자동재생 정책 때문에 첫 클릭(합격 문자 열기) 시점에 오디오를 활성화한다.

### FR-11 디버그·시연 도구 (`?debug=1`일 때만 활성)
| 키 | 동작 |
|---|---|
| F1 | 오프닝 건너뛰기 |
| F2 | 다음 미클리어 퀘스트 NPC 앞으로 순간이동 |
| F3 | 현재 미니게임 즉시 성공 처리 |
| F4 | 스킬 5개 모두 지급 (엔딩 직행 테스트) |
| F6/F7/F8 | 돌발상황 3종 즉시 발생 |
| \` | FPS 패널(r3f-perf) 토글 |

`window.__game` 전역 객체로 같은 기능을 E2E 테스트에 노출한다.

## 1.9 비기능 요구사항

- NFR-1 성능: 시연용 노트북 크롬에서 평균 50fps 이상, 초기 로딩 5초 이내(에셋 총합 15MB 이하).
- NFR-2 안정성: 시연 경로에 외부 API 호출이 없다. 네트워크가 끊겨도 로컬 빌드(`npm run preview`)로 동작한다.
- NFR-3 해상도: 1920×1080 기준으로 설계하고 1280×720까지 HUD가 겹치지 않는다.
- NFR-4 코드 품질: TypeScript `strict`, `any` 금지, 파일당 400줄 목표(800줄 상한), 게임 로직은 순수 함수로 분리하여 테스트한다.
- NFR-5 언어: UI 문구는 한국어, 코드와 커밋 메시지는 영어.

## 1.10 학과 콘텐츠

### 퀘스트 학과 5개 (구현 순서)

#### Q1. 전자공학부 (임베디드) — "볼트를 맞춰라"
- NPC: **납땜 선배** · 브레드보드 앞에서 자율주행 배달 로봇(머리에 라이다 센서가 달린 상자 로봇)을 고치고 있다.
- 말풍선: "아 또 쇼트났네…" / "멀티미터 누가 가져갔냐" / "로봇이 벽이랑 사랑에 빠졌어"
- 학과 소개: "전자공학부는 회로부터 반도체, 임베디드 시스템까지 '전기가 흐르는 모든 것'을 다뤄." / "나는 임베디드 트랙인데, 작은 컴퓨터를 로봇이나 기계에 심는 걸 배워."
- 제안: "지금 자율주행 배달 로봇을 만들고 있는데, 전압이 안 맞아서 안 움직여. 좀 도와줄래?"
- 미니게임 (DialGame): 레벨 컨버터의 가변저항 다이얼을 드래그로 돌려 멀티미터 표시값을 목표 전압에 맞춘다.
  - 1단계: 아두이노용 5.0V (허용 ±0.1V), 2단계: 라이다 센서용 3.3V (허용 ±0.1V)
  - 허용 범위 안에서 1초 유지하면 "LOCK" 표시와 함께 다음 단계로 넘어간다.
  - 다이얼 각도(0~270°)를 출력 전압(0~12V)으로 변환하는 곡선은 살짝 비선형으로 만들어 손맛을 준다.
  - 힌트: "천천히 돌려 봐. 5V 근처에서 미세하게!"
- 성공 연출: 배달 로봇이 3D 월드에서 실제로 출발해 광장을 한 바퀴 돈다(시간이 남으면).
- 스킬: 📡 **라이다 센서: 거리두기 능력** — "교수님과의 거리를 실시간으로 측정합니다. 회피 확률이 올라간 것 같은 기분이 듭니다."

#### Q2. 디자인학부 (제품디자인) — "컵을 그려라"
- NPC: **야작 선배** · 이젤 앞에서 머그컵 스케치를 하고 있다. 주변에 종이컵 모형이 쌓여 있다.
- 말풍선: "오늘도 야작각이네…" / "크리틱 내일인데 아직 러프도 안 나옴" / "이 곡선… 이 곡선이 아니야"
- 학과 소개: "디자인학부에서는 시각, 제품, 영상 디자인을 배워." / "제품 디자인은 사람이 손에 쥐는 물건의 형태를 설계하는 일이야. 평면도부터 시작하지."
- 제안: "기초제품디자인 과제로 컵 평면도를 그려야 하는데 손이 떨려서… 대신 따라 그려 줄래?"
- 미니게임 (TraceGame): 캔버스에 점선으로 된 컵 평면도(몸통 + 손잡이)가 있다. 마우스를 누른 채 점선을 따라 그린다.
  - 판정: 점선 위 샘플 포인트 중 그린 선과 12px 이내인 비율(coverage) ≥ 75%, 그린 선 중 점선에서 25px 이상 벗어난 비율 ≤ 20%.
  - [지우기], [제출] 버튼을 둔다. 제출하면 점수와 합격/불합격을 보여 준다.
  - 힌트: 2회 실패 후 점선이 더 굵고 진하게 바뀐다.
- 스킬: 🎨 **고흐의 미감** — "세상이 살짝 더 노랗고 소용돌이쳐 보입니다. 귀는 소중히 하세요."

#### Q3. 수학과 — "빈칸을 채워라"
- NPC: **증명 선배** · 칠판 앞에서 분필로 수식을 쓰고 있다. 바닥에 구겨진 연습장이 흩어져 있다.
- 말풍선: "증명 끝… 아 아니네" / "자명하다(자명하지 않음)" / "엡실론이 0보다 크다고 하자…"
- 학과 소개: "수학과는 공식을 외우는 곳이 아니라 왜 성립하는지 증명하는 곳이야." / "규칙을 찾고, 그 규칙이 항상 맞는지 따지는 게 우리 일이지."
- 제안: "해석학 과제 하다가 머리가 터질 것 같아. 기초 문제부터 같이 풀어 줄래?"
- 미니게임 (FillBlankGame): 수열 가운데 빈칸에 숫자 타일을 드래그해 넣는다. 3라운드를 모두 맞히면 클리어한다.
  - R1 등차수열: `3, 7, 11, □, 19` (보기: 13, 14, 15, 16) → 15
  - R2 등비수열: `2, 6, □, 54, 162` (보기: 12, 18, 24, 36) → 18
  - R3 등비수열: `81, 27, 9, □, 1` (보기: 0, 3, 4.5, 6) → 3
  - 힌트: "옆 숫자끼리 빼 보거나 나눠 봐."
- 스킬: 📐 **피타고라스의 각도기** — "모든 각을 직각으로 봅니다. 인간관계도 직각입니다."

#### Q4. 동북아국제통상학부 (어문) — "문장을 완성하라"
- NPC: **니하오 동기** · 벤치에 앉아 단어 카드를 넘기며 중국어를 중얼거린다. 옆에 작은 오성홍기가 아닌 '중국어 스터디' 팻말을 둔다.
- 말풍선: "니하오… 아니 이거 성조 맞나?" / "HSK 5급까지 D-30" / "상하이 교환학생 가고 싶다"
- 학과 소개: "동북아국제통상학부는 중국·일본과의 무역과 비즈니스를 배우는 곳이야. 인천대 시그니처 학과지!" / "통상 공부랑 중국어를 같이 해야 해서 매일 단어랑 싸우는 중이야."
- 제안: "중국어 작문 숙제인데 단어 순서가 헷갈려. 같이 맞춰 줄래?"
- 미니게임 (OrderingGame, 단어 모드): 한국어 뜻과 섞인 단어 블록이 주어지고, 듀오링고처럼 블록을 순서대로 끌어다 놓는다. 블록에는 병음을 작게 함께 표시한다.
  - R1 "나는 학생입니다." → `我 / 是 / 学生`
  - R2 "나는 인천대학교 학생입니다." → `我 / 是 / 仁川大学 / 的 / 学生`
  - 힌트: "중국어도 영어처럼 '주어-동사-목적어' 순서야."
- 스킬: 🇨🇳 **제갈량의 지략** — "회의에서 세 수 앞을 내다봅니다. 팀플 조장 각입니다."
  - 메모: 회의에서 나온 실존 정치인 패러디 스킬은 공개 발표 리스크가 있어 역사 인물로 대체했다. 원안을 쓰고 싶다면 `data/skills.ts`의 문구만 바꾸면 된다.

#### Q5. 컴퓨터공학부 — "서버를 살려라"
- NPC: **서버 지킴이 선배** · 서버 랙 앞에서 노트북을 들고 서 있다. 랙의 LED가 빨갛게 깜빡인다.
- 말풍선: "서버 또 터졌네…" / "push --force 누가 했냐" / "제 컴퓨터에선 잘 되는데요?"
- 학과 소개: "컴퓨터공학부는 소프트웨어, AI, 시스템을 배워. 요즘 제일 핫하지." / "근데 현실은 새벽 3시에 서버 살리는 사람들이야."
- 제안: "학교 축제 사이트 서버가 터졌어! 코드 블록 순서가 꼬였는데 바로잡아 줄래?"
- 미니게임 (OrderingGame, 코드 모드): 의사코드 블록 4~5개를 실행 순서대로 정렬한다.
  - 정답 순서: `요청 받기` → `로그인 확인` → `데이터베이스에서 축제 정보 조회` → `결과를 화면용으로 변환` → `응답 보내기`
  - 성공하면 모달 안 터미널에 `200 OK`가 찍히고, 3D 월드의 서버 랙 LED가 초록으로 바뀐다.
  - 힌트: "확인부터 하고 꺼내야지. 로그인 안 한 사람한테 데이터 주면 큰일 나."
- 스킬: 🐧 **리누스 토르발스의 손가락** — "타자 속도가 빨라진 것 같습니다. 단, 말투가 공격적으로 변합니다."

### 대화 NPC 15명 (인기 학과 리스트 기반)

대화 NPC는 말풍선 3개 + 학과 소개 2~3줄 + 마무리 대사 "나중에 우리 과 과제도 도와줘!"로 구성한다. 도감에는 예약 스킬을 "Coming Soon"으로 표시한다.

| # | 학과 | NPC 행동/소품 | 말풍선 예시 | 예약 스킬 |
|---|---|---|---|---|
| 1 | 경영학부 | 노트북으로 팀플 PPT 수정 | "팀플 무임승차 신고합니다" | 💼 워런 버핏의 복리 감각 |
| 2 | Global Trade & Service학부 | 컨테이너 박스 위 서류 | "송도항 컨테이너 몇 개 들어왔지?" | 🚢 장보고의 무역로 |
| 3 | 세무회계학과 | 전자계산기 두드리기 | "차변 대변… 대변이 안 맞아" | 🧾 1원 단위 집착 |
| 4 | 미디어커뮤니케이션학과 | 삼각대 카메라 촬영 | "오늘 브이로그 각이다" | 🎥 알고리즘의 간택 |
| 5 | 행정학과 | 서류 더미 정리 | "공문 양식이 또 바뀌었대" | 🏛️ 결재 라인 통찰력 |
| 6 | 소비자학과 | 설문지 클립보드 | "설문 하나만 해 주실 수 있나요?" | 🛒 장바구니 심리학 |
| 7 | 생명공학/분자의생명 | 실험복 + 피펫 | "세포 배양 시간 맞춰야 해" | 🧬 PCR 증폭술 |
| 8 | 바이오-로봇시스템공학과 | 로봇팔 조종 | "로봇팔이 또 나한테 하이파이브했어" | 🦾 아이언맨의 의수 |
| 9 | 정보통신공학과 | 안테나/공유기 | "와이파이 왜 이렇게 느려" | 📶 5G 텔레파시 |
| 10 | 에너지화학공학과 | 배터리 셀 + 비커 | "배터리 셀 하나만 더…" | 🔋 무한 동력 체력 |
| 11 | 기계공학과 | 대형 톱니바퀴 + 공구 | "도면 한 장만 더 그리면 끝" | ⚙️ 에디슨의 손재주 |
| 12 | 역사교육과 | 고지도 펼쳐 보기 | "이건 1차 사료가 아니야" | 📜 실록 기억력 |
| 13 | 영어교육과 | 단어장 + 임용 달력 | "임용까지 D-300" | 🗽 셰익스피어의 혀 |
| 14 | 창의인재개발학과 | 포스트잇 보드 | "아이스브레이킹 한 판 할까요?" | 🧠 HR 독심술 |
| 15 | 도시행정학과/스마트물류공학전공 | 드론 + 택배 박스 | "송도 교통 시뮬레이션 돌리는 중" | 🏙️ 심시티 시장 감각 |

자유전공학부(인문)는 주인공의 소속이므로 NPC에서 제외한다.

### 분위기 NPC (시간 남으면, P2)
ROTC 후보생(구보 중), 대학원생(커피 들고 좀비 걸음), 조교, 외국인 교환학생, 시설관리 부장님이 광장을 배회한다. 대화는 한 줄 대사만 갖는다. 교수 NPC는 돌발상황 이벤트에서 사용한다.

### 과잠 색상표

| 학과 | 몸판 | 소매 | 등판 문구 |
|---|---|---|---|
| 자유전공학부 (시작) | #1F2A44 남색 | #FFFFFF | INU 자유전공학부 27 |
| 전자공학부 | #0B6E4F 초록 | #F2C14E | INU 전자공학부 27 |
| 디자인학부 | #E94F37 주홍 | #FFFFFF | INU 디자인학부 27 |
| 수학과 | #3B5BA9 파랑 | #F4F4F4 | INU 수학과 27 |
| 동북아국제통상학부 | #8C1C13 버건디 | #F2D0A4 | INU 동북아국제통상학부 27 |
| 컴퓨터공학부 | #111111 검정 | #39FF14 | INU 컴퓨터공학부 27 |

## 1.11 범위 밖 (이번 해커톤에서 하지 않음)

- 자기장(잔소리·시험·스트레스로 맵이 좁아지는 압박 장치): 탐색형 루프와 충돌하므로 제외한다. 포스트 해커톤 아이디어로 발표에서만 언급한다.
- 스킬의 실제 게임플레이 효과, 실시간 TTS, 차량, 실내 맵, 멀티플레이, 세이브/로드, 모바일 대응.
- 대화 NPC 15명의 퀘스트 (데이터 구조는 확장 가능하게 만든다).

## 1.12 성공 기준

1. 오프닝 → 퀘스트 5개 → 과잠 수여식 → 크레딧까지 디버그 키 없이 끝까지 플레이할 수 있다.
2. 단위·컴포넌트·E2E 테스트가 모두 통과한다.
3. Vercel 배포 URL과 로컬 preview 빌드가 둘 다 동작한다.
4. 시연 노트북에서 평균 50fps 이상이 나온다.
5. 처음 보는 사람이 설명 없이 첫 퀘스트를 3분 안에 클리어한다(팀원 외 1명 테스트).

---

# Part 2. 단계별 구현 계획

## 2.1 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 빌드 | Vite + React 19 + TypeScript (strict) | 빠른 HMR, AI가 가장 익숙한 스택 |
| 3D | three, @react-three/fiber, @react-three/drei | 선언형 씬 구성, glTF·Sky·Environment·Instances 헬퍼 |
| 물리·캐릭터 | @react-three/rapier + ecctrl | 3인칭 캐릭터 컨트롤러와 카메라 충돌을 바로 사용, 실패 시 자체 컨트롤러로 대체 |
| 후처리 | @react-three/postprocessing | 약한 Bloom + SMAA, 품질 토글 가능 |
| 상태 | zustand (도메인별 슬라이스) | 3D 루프와 React UI 사이 상태 공유, 셀렉터로 리렌더 최소화 |
| 드래그 | @dnd-kit/core, @dnd-kit/sortable | 정렬형 미니게임, 키보드 센서로 테스트 가능 |
| 애니메이션(UI) | framer-motion | 스킬 획득, 알림, 오프닝 연출 |
| 사운드 | Web Audio API(비프 합성) + howler(BGM/효과음) | 외부 API 없이 안정적 |
| 테스트 | vitest, @testing-library/react, playwright | 단위·컴포넌트·E2E |
| 성능 측정 | r3f-perf (debug 모드만) | FPS, draw call 확인 |
| 배포 | Vercel (정적 사이트) | URL 하나로 시연과 공유 |

## 2.2 에셋 계획 (모두 CC0)

| 용도 | 출처 | 비고 |
|---|---|---|
| 주인공/NPC 캐릭터 | Quaternius "Ultimate Animated Character Pack" 또는 KayKit Adventurers | Idle/Walk/Run/Wave 애니메이션 포함 glTF. 몸통 재질이 분리된 모델을 고른다 |
| 소품 | Kenney (Furniture, Food, Prototype), Poly Pizza | 커피 카트, 벤치, 이젤, 칠판, 서버 랙, 상자 |
| 나무 | Quaternius "Stylized Nature" | 소나무형 위주, Instances로 배치 |
| 건물 | 코드로 생성 | 박스 + 창문 텍스처(CanvasTexture) + 학과 상징 오브젝트 |
| 하늘·환경광 | drei `<Sky>`, `<Environment preset="city">` | |
| 효과음·BGM | Kenney Audio, Pixabay(상업 허용 라이선스) | 다운로드 후 `public/audio`에 저장 |

과잠 처리 방식:
- 1안: 캐릭터 glTF의 상의 재질에 `CanvasTexture`를 입힌다. 텍스처에는 몸판 색, 소매 색, 등판 문구를 그리며 `drawJacketTexture(spec)` 함수 하나로 생성한다.
- 2안(1안이 UV 문제로 실패하면): 캐릭터 상의 위에 코드로 만든 과잠 메쉬(몸통 박스 + 소매 실린더, 둥근 모서리)를 본(bone)에 붙이고 등판에 `<Decal>`이나 `<Text>`로 문구를 얹는다.
- 3안(시간이 없으면): 캐릭터 전체를 코드로 만든 치비 캐릭터(구 머리 + 둥근 박스 몸통)로 바꾸고 몸통에 과잠 텍스처를 입힌다.
- Phase 0 스파이크에서 15분 안에 1안 성공 여부를 판정한다.

## 2.3 디렉터리 구조

```
ai-vibe-hackaton/
├── plan.md
├── CLAUDE.md                      # 프로젝트 지도 (Phase 0에서 생성)
├── index.html
├── package.json / tsconfig.json / vite.config.ts / vitest.config.ts / playwright.config.ts
├── public/
│   ├── models/                    # glTF (characters, props, nature)
│   └── audio/                     # bgm, sfx
├── src/
│   ├── main.tsx
│   ├── App.tsx                    # Canvas + UI 레이어 + phase 라우팅
│   ├── game/
│   │   ├── types.ts               # ★ 공용 계약 (Phase 0에서 확정, 이후 lead만 수정)
│   │   └── config.ts              # 상수 (반경, 스태미나 수치, 이벤트 간격)
│   ├── data/
│   │   ├── departments.ts         # 20개 학과: id, 이름, 색, 이모지, 과잠 스펙
│   │   ├── npcs.ts                # NPC 배치 좌표, 회전, 소품, 대사
│   │   ├── quests.ts              # 퀘스트 5개 정의 + 미니게임 데이터
│   │   ├── skills.ts              # 스킬 20개 (5 획득 가능 + 15 예약)
│   │   └── events.ts              # 돌발상황 3종 정의
│   ├── logic/                     # ★ 순수 함수, 100% 단위 테스트 대상
│   │   ├── questMachine.ts
│   │   ├── stamina.ts
│   │   ├── eventScheduler.ts
│   │   ├── rng.ts                 # 시드 고정 가능한 난수
│   │   ├── proximity.ts           # 가장 가까운 상호작용 대상 계산
│   │   ├── minimap.ts             # 월드 좌표 → 미니맵 좌표 변환
│   │   ├── jacket.ts              # 과잠 스펙 계산
│   │   └── minigames/
│   │       ├── dial.ts            # 각도 → 전압, LOCK 판정
│   │       ├── trace.ts           # coverage / deviation 점수
│   │       ├── fillBlank.ts
│   │       └── ordering.ts
│   ├── stores/
│   │   ├── useGameStore.ts        # phase, paused, debug
│   │   ├── usePlayerStore.ts      # position, heading, stamina, jacket
│   │   ├── useQuestStore.ts       # 퀘스트별 상태, 실패 횟수
│   │   ├── useSkillStore.ts       # 획득 스킬, 새 스킬 하이라이트
│   │   ├── useDialogueStore.ts    # 현재 대화 스크립트, 줄 번호, 선택지
│   │   └── useNotificationStore.ts
│   ├── world/
│   │   ├── GameCanvas.tsx         # Canvas, Physics, 조명, 후처리
│   │   ├── Plaza.tsx              # 바닥(지그재그 벽돌), 잔디, 산책로, 경계 벽
│   │   ├── Buildings.tsx          # 12호관 등 건물 박스
│   │   ├── Landmarks.tsx          # 물결 벤치 조형물, 지하 계단 캐노피, 분수대(엔딩 ★)
│   │   ├── Backdrop.tsx           # 바다, LNG 탱크, 원경 산
│   │   ├── Trees.tsx
│   │   ├── Player.tsx             # ecctrl + 캐릭터 + 과잠
│   │   ├── JacketMaterial.tsx     # drawJacketTexture 적용
│   │   ├── Npc.tsx                # NPC 1명 (모델, 소품, 애니메이션)
│   │   ├── NpcBubble.tsx          # drei <Html> 말풍선 + ! 아이콘
│   │   ├── NpcLayer.tsx           # data/npcs.ts → Npc 렌더링
│   │   ├── CoffeeCart.tsx
│   │   ├── EventActors.tsx        # 교수, 동기, 간식 부스
│   │   ├── DeliveryRobot.tsx      # Q1 보상 연출 (P2)
│   │   └── EndingStage.tsx        # 엔딩 컷신 카메라 + NPC 집결
│   ├── ui/
│   │   ├── hud/ (Hud.tsx, Minimap.tsx, StaminaRing.tsx, SkillList.tsx, QuestTracker.tsx, NotificationStack.tsx, MuteToggle.tsx)
│   │   ├── dialogue/ (DialogueBox.tsx, ChoiceButtons.tsx, useTypewriter.ts)
│   │   ├── minigames/ (MinigameModal.tsx, DialGame.tsx, TraceGame.tsx, FillBlankGame.tsx, OrderingGame.tsx)
│   │   └── overlays/ (OpeningSequence.tsx, PhoneNotice.tsx, AdmissionLetter.tsx, SkillAcquired.tsx, SkillDex.tsx, EndingSelect.tsx, JacketCeremony.tsx, Credits.tsx)
│   ├── audio/ (beep.ts, sfx.ts, bgm.ts)
│   └── debug/ (devHooks.ts, DebugKeys.tsx)
└── tests/
    ├── unit/                      # logic, stores, data 무결성
    ├── component/                 # DialogueBox, 미니게임, HUD
    └── e2e/                       # playwright
```

## 2.4 공용 계약 (`src/game/types.ts`)

Phase 0에서 이 파일을 먼저 확정하고, 모든 에이전트가 이 타입만 보고 병렬로 작업한다.

```ts
export type DepartmentId =
  | 'ee' | 'design' | 'math' | 'neat' | 'cse'            // 퀘스트 학과 5
  | 'biz' | 'gts' | 'tax' | 'media' | 'pa' | 'consumer'
  | 'bio' | 'biorobot' | 'ice' | 'energy' | 'mech'
  | 'histedu' | 'engedu' | 'hrd' | 'urban';               // 대화 학과 15

export interface JacketSpec {
  bodyColor: string;
  sleeveColor: string;
  backText: string;              // "INU 컴퓨터공학부 27"
}

export interface Department {
  id: DepartmentId;
  name: string;
  emoji: string;
  jacket: JacketSpec;
  symbol: string;                // 크레딧·건물 장식용 상징물 키
}

export interface DialogueLine { speaker: string; text: string }

export interface NpcDef {
  id: string;
  departmentId: DepartmentId;
  displayName: string;           // "납땜 선배"
  position: [number, number, number];
  rotationY: number;
  modelKey: string;
  propKeys: string[];
  voicePitch: number;            // 비프음 기준 주파수(Hz)
  barks: string[];               // 말풍선, 3개 이상
  intro: DialogueLine[];
  questId?: QuestId;
}

export type QuestId = 'q1-ee' | 'q2-design' | 'q3-math' | 'q4-neat' | 'q5-cse';
export type QuestStatus = 'locked' | 'available' | 'offered' | 'inProgress' | 'cleared';

export type MinigameSpec =
  | { kind: 'dial'; stages: { targetV: number; toleranceV: number; label: string }[]; holdMs: number }
  | { kind: 'trace'; pathId: 'cup'; coverageMin: number; deviationMax: number }
  | { kind: 'fillBlank'; rounds: { sequence: (number | null)[]; options: number[]; answer: number }[] }
  | { kind: 'ordering'; mode: 'word' | 'code'; rounds: { prompt: string; tokens: { id: string; label: string; sub?: string }[]; answer: string[] }[] };

export interface QuestDef {
  id: QuestId;
  order: 1 | 2 | 3 | 4 | 5;
  departmentId: DepartmentId;
  npcId: string;
  offer: DialogueLine[];         // "도와줄래?"까지
  declineLine: string;
  successLines: DialogueLine[];
  hint: string;
  minigame: MinigameSpec;
  skillId: string;
}

export interface SkillDef {
  id: string;
  departmentId: DepartmentId;
  emoji: string;
  name: string;
  description: string;
  obtainable: boolean;           // false면 도감에 Coming Soon
}

export type GamePhase =
  | 'boot' | 'opening' | 'explore' | 'dialogue' | 'minigame'
  | 'skillAcquired' | 'endingCutscene' | 'endingSelect' | 'jacketCeremony' | 'credits';

export type RandomEventId = 'professorKidnap' | 'assignmentAlert' | 'snackEvent';
```

## 2.5 단계별 계획 (타임라인)

시각은 오늘(11/6) 기준 예시이며, 기획이 끝난 시점을 T0로 놓고 상대 시간으로 관리한다. 데모 코드 프리즈는 **14:00**이다.

| 단계 | 시간 | 내용 | 완료 조건 (Exit) | 커밋 |
|---|---|---|---|---|
| Phase 0 | T0 ~ T0+25분 | 스캐폴딩, 계약, 스파이크 | 빈 광장에서 캐릭터가 걷고, 테스트 러너가 돈다 | `chore: scaffold` |
| Phase 1 | +25 ~ +85분 | 5개 트랙 병렬 개발 | 트랙별 체크리스트 완료 + 트랙 테스트 통과 | 트랙별 1~3회 |
| Phase 2 | +85 ~ +105분 | 통합 + Q1 수직 슬라이스 | 오프닝 → Q1 클리어 → 스킬 목록 반영까지 실제 플레이 | `feat: q1 vertical slice` |
| Phase 3 | +105 ~ +135분 | Q2 → Q3 → Q4 → Q5 순서로 연결 + 엔딩 | 5개 퀘스트와 과잠 수여식이 디버그 없이 동작 | 퀘스트마다 1회 |
| Phase 4 | +135 ~ 14:00 | 폴리싱, 전체 테스트, 배포 | 전 테스트 통과, Vercel URL, 50fps | `chore: release demo` |
| Phase 5 | 14:00 ~ 14:30 | 시연 리허설 (코드 수정은 치명 버그만) | 리허설 2회 무사고 | |

### Phase 0: 스캐폴딩과 계약 (리드 단독, 25분)

1. `npm create vite@latest . -- --template react-ts`, 의존성 설치.
2. `tsconfig` strict, ESLint + Prettier, `vitest`, `playwright` 설정, `npm test`/`npm run e2e` 스크립트 추가.
3. `src/game/types.ts`, `src/game/config.ts` 작성 (2.4절 그대로).
4. `src/stores/*` 6개 파일을 **인터페이스와 빈 액션**으로 생성한다. 액션 시그니처를 먼저 고정한다.
5. `data/*`에 빈 배열과 Q1 데이터 1건만 넣는다.
6. 스파이크 A: `GameCanvas` + 평면 + ecctrl 캐릭터가 WASD로 걷는지 확인한다.
7. 스파이크 B: 캐릭터 glTF 상의에 CanvasTexture 과잠이 입혀지는지 확인한다(2.2절 1안/2안/3안 판정).
8. `App.tsx`에 phase별 레이어 라우팅 골격을 만든다.
9. `CLAUDE.md`에 디렉터리 지도, 계약 파일 위치, 실행/테스트 명령을 기록한다.
10. 커밋 후, 트랙별 git worktree를 생성한다.

### Phase 1: 병렬 트랙 (60분)

각 트랙의 상세 체크리스트는 Part 3의 에이전트 브리프에 있다. 요약은 다음과 같다.

| 트랙 | 산출물 |
|---|---|
| A. World | 광장 바닥·잔디·산책로·경계, 건물 4~5동, 조형물, 분수대, 바다와 원경, 나무, 조명·하늘·후처리 |
| B. Player & NPC | 3인칭 컨트롤러, 걷기/달리기 애니메이션, 과잠 재질, NPC 20명 배치·소품·Idle, 말풍선, 근접 판정과 E 상호작용, 커피 카트 |
| C. HUD & Overlay | 미니맵, 스태미나 링, 스킬 목록, 퀘스트 트래커, 알림, 대화창(타이핑+비프), 오프닝 전 과정, 스킬 획득 연출, 도감 |
| D. Minigames | DialGame, TraceGame, FillBlankGame, OrderingGame(단어/코드) + 로직 함수 + MinigameModal |
| E. Systems & Content | questMachine, stamina, eventScheduler, rng, 돌발상황 액터 로직, data 20개 학과·NPC·퀘스트·스킬 전체 작성, 디버그 키와 `window.__game` |

### Phase 2: 통합과 Q1 수직 슬라이스 (20분)

트레이서 불릿 원칙에 따라 Q1 하나를 처음부터 끝까지 관통시킨 뒤에 나머지를 붙인다.

1. 트랙 브랜치를 A → E → B → D → C 순서로 병합한다(의존성이 적은 것부터).
2. 흐름 연결: `NpcBubble` 클릭 → `useDialogueStore.start(npc)` → 대화 종료 시 `questMachine` 전이 → `useGameStore.setPhase('minigame')` → `MinigameModal`이 `QuestDef.minigame.kind`로 컴포넌트 선택 → 성공 시 `useSkillStore.grant()` → `SkillAcquired` → `explore` 복귀.
3. 대화·미니게임 중 이동 입력 차단과 포인터 잠금 해제를 확인한다.
4. E2E `q1.spec.ts`를 통과시킨다.

### Phase 3: 퀘스트 순서대로 연결 + 엔딩 (30분)

퀘스트 하나를 붙일 때마다 다음 체크리스트를 반복하고 커밋한다.

```
[ ] data/quests.ts에 QuestDef 완성 (offer, success, hint, minigame 데이터)
[ ] data/npcs.ts에 NPC 좌표·소품·말풍선 확정
[ ] 3D 소품 배치 확인 (멀리서도 학과가 보이는가)
[ ] 실제 플레이로 클리어 (디버그 키 없이)
[ ] 실패 2회 → 힌트 표시 확인
[ ] 스킬 목록·도감·퀘스트 트래커 반영 확인
[ ] 단위 테스트 + E2E 해당 시나리오 통과
[ ] 커밋: feat(quest): add q{n} {department}
```

| 순서 | 퀘스트 | 재사용하는 템플릿 | 추가 작업 |
|---|---|---|---|
| 1 | Q1 전자공학부 | DialGame | (Phase 2에서 완료) 배달 로봇 소품 |
| 2 | Q2 디자인학부 | TraceGame | 컵 평면도 경로 데이터 |
| 3 | Q3 수학과 | FillBlankGame | 칠판 소품 |
| 4 | Q4 동북아국제통상학부 | OrderingGame(word) | 병음 표시 |
| 5 | Q5 컴퓨터공학부 | OrderingGame(code) | 서버 랙 LED 상태 연동 |
| 6 | 엔딩 | - | ★ 마커, EndingStage 컷신, EndingSelect, JacketCeremony, Credits |

엔딩 구현 세부:
- `useSkillStore`의 획득 수가 5가 되면 `questMachine`이 `endingUnlocked` 플래그를 세우고 알림과 ★ 마커를 띄운다.
- ★ 반경 3m 진입 → phase `endingCutscene`: 입력 차단, 퀘스트 NPC 5명을 미리 정한 반원 좌표로 순간이동시키고 카메라를 정면 궤도로 이동한다(ecctrl 카메라를 끄고 `CameraControls`로 전환).
- phase `endingSelect`: `EndingSelect` 카드 5장 → 확인 대화.
- phase `jacketCeremony`: 타임라인(0s NPC 전진, 2s 대사, 5s 플래시, 5.2s `usePlayerStore.setJacket(dept.jacket)`, 6~10s 카메라 등 뒤로 회전, 8s 파티클·BGM, 10s 하단 문구) → `credits`.

### Phase 4: 폴리싱·테스트·배포 (25분)

1. 전체 테스트 실행: `npx tsc --noEmit && npx vitest run && npx playwright test`.
2. 성능 점검: debug 모드에서 r3f-perf 확인. 50fps 미만이면 5.2절 성능 컷 순서대로 적용한다.
3. 처음 보는 사람 1명에게 플레이를 맡기고, 막힌 지점을 대사나 힌트로 보완한다.
4. `npm run build && npm run preview`로 로컬 빌드를 확인한다(오프라인 시연 백업).
5. Vercel에 배포하고 URL을 팀에 공유한다.
6. 커밋, 태그 `demo-v1`.

---

# Part 3. 멀티 에이전트 작업 계획

## 3.1 운영 원칙

1. **계약 우선**: `src/game/types.ts`와 store 액션 시그니처는 Phase 0에서 고정하고, 이후에는 리드만 수정한다. 변경이 필요하면 에이전트는 리드에게 요청한다.
2. **파일 소유권**: 트랙마다 수정 가능한 디렉터리를 정해서 병합 충돌을 없앤다. 다른 트랙 파일이 필요하면 import만 하고 수정하지 않는다.
3. **worktree 격리**: 트랙마다 `git worktree`로 브랜치를 분리한다(`feat/world`, `feat/player-npc`, `feat/hud`, `feat/minigames`, `feat/systems`).
4. **TDD**: `logic/` 함수는 실패하는 테스트를 먼저 쓰고 구현한다. 트랙 완료 전에 해당 테스트를 반드시 실행한다.
5. **작게 커밋**: 트랙마다 체크리스트 2~3개 단위로 커밋한다.
6. **목업 우선**: 다른 트랙 결과물이 필요한 곳은 store에 직접 값을 넣어 단독으로 확인한다(예: HUD 트랙은 `useSkillStore.setState`로 스킬 3개를 넣어 놓고 개발).
7. **같은 에러 2회 반복 시 즉시 중단**하고 원인을 리드에게 보고한다.

## 3.2 에이전트 구성과 소유권

| 에이전트 | 모델 | 브랜치 | 소유 파일 |
|---|---|---|---|
| Lead (메인 세션) | Opus | main | `game/*`, `App.tsx`, `stores/*` 시그니처, 병합, `CLAUDE.md` |
| A. World | Sonnet | feat/world | `world/GameCanvas.tsx`, `Plaza.tsx`, `Buildings.tsx`, `Landmarks.tsx`, `Backdrop.tsx`, `Trees.tsx`, `public/models/nature` |
| B. Player & NPC | Sonnet | feat/player-npc | `world/Player.tsx`, `JacketMaterial.tsx`, `Npc.tsx`, `NpcBubble.tsx`, `NpcLayer.tsx`, `CoffeeCart.tsx`, `EventActors.tsx`, `EndingStage.tsx`, `logic/proximity.ts`, `logic/jacket.ts`, `public/models/characters,props` |
| C. HUD & Overlay | Sonnet | feat/hud | `ui/hud/*`, `ui/dialogue/*`, `ui/overlays/*`, `audio/*`, `logic/minimap.ts`, `public/audio` |
| D. Minigames | Sonnet | feat/minigames | `ui/minigames/*`, `logic/minigames/*` |
| E. Systems & Content | Sonnet | feat/systems | `logic/questMachine.ts`, `stamina.ts`, `eventScheduler.ts`, `rng.ts`, `stores/*` 구현부, `data/*`, `debug/*` |
| Reviewer | Sonnet | - | Phase 2 직후와 Phase 4에서 `code-reviewer` 실행 (읽기 전용) |

## 3.3 에이전트 브리프

각 브리프는 에이전트 프롬프트에 그대로 넣는다. 모든 브리프 앞에는 공통 머리말을 붙인다.

> 공통 머리말: "plan.md의 Part 1(PRD)과 2.4절 계약을 읽어라. `src/game/types.ts`는 수정하지 마라. 소유 파일 외에는 수정하지 마라. logic 함수는 테스트를 먼저 써라. 끝나면 `npx tsc --noEmit`과 `npx vitest run`을 실행하고 결과를 보고하라. 같은 에러가 2번 반복되면 멈추고 보고하라."

### A. World
- [ ] `GameCanvas`: `<Canvas shadows>`, `<Physics>`, DirectionalLight(따뜻한 색, 그림자 2048, 그림자 카메라 범위 ±60), HemisphereLight, `<Sky>`, `<Environment preset="city">`, 약한 fog, `<EffectComposer>`(Bloom 0.3, SMAA), 품질 저하 플래그.
- [ ] `Plaza`: 120×120 바닥. 붉은 벽돌 + 연분홍 지그재그 패턴을 CanvasTexture로 그려 반복한다. 가운데 잔디 직사각형 2개, 대각선 산책로, 경계 투명 콜라이더.
- [ ] `Buildings`: 12호관(회색 6층, 외벽에 "12"), 유리 박스 건물(도서관풍), 베이지 석재 건물 2동. 창문은 CanvasTexture. 모두 `CuboidCollider`.
- [ ] `Landmarks`: 물결 벤치 조형물(TubeGeometry로 사인파), 지하 계단 캐노피, 중앙 분수대(엔딩 ★ 지점, 좌표는 `config.ENDING_POINT`).
- [ ] `Backdrop`: 맵 바깥 바다 평면(반사 없이 그라데이션 셰이더), 원경 LNG 탱크 실린더 6개, 낮은 산 실루엣.
- [ ] `Trees`: 소나무 40~60그루를 Instances로 배치(좌표는 시드 고정 난수 + 잔디 영역 제한).
- 완료 확인: 위에서 본 스크린샷이 광장 사진의 구도와 비슷하다. 빈 씬 기준 60fps.

### B. Player & NPC
- [ ] ecctrl로 3인칭 컨트롤러 구성: 걷기 3.5m/s, 달리기 7m/s, 카메라 거리 4.5m, 높이 1.6m, 마우스 회전. `usePlayerStore`에 매 프레임 position/heading 기록(초당 10회로 스로틀).
- [ ] 캐릭터 애니메이션 Idle/Walk/Run 전환.
- [ ] `JacketMaterial`: `drawJacketTexture(spec)`로 CanvasTexture 생성, `usePlayerStore.jacket` 변경 시 텍스처 교체. 스파이크 결과에 따라 1안/2안/3안 중 하나로 구현.
- [ ] 이동 차단: `useGameStore.phase !== 'explore'`면 입력 무시.
- [ ] `Npc`: `SkeletonUtils.clone`으로 모델 재사용, Idle 루프, 소품 배치, 주인공이 다가오면 주인공 쪽으로 고개(몸) 회전.
- [ ] `NpcBubble`: drei `<Html>`로 머리 위 말풍선. 6m 안에서 표시, 8초마다 대사 교체, 퀘스트 NPC는 `!` 아이콘(클리어 후 ✓). 클릭 시 `useDialogueStore.start(npcId)`.
- [ ] `logic/proximity.ts`: 주인공 위치와 상호작용 대상 목록을 받아 3m 안 가장 가까운 대상을 반환. E 키로 상호작용.
- [ ] `CoffeeCart` 2곳: E로 스태미나 회복 액션 호출.
- [ ] `EventActors`: 교수(주인공 추적, 속도 6m/s, 8초 후 퇴장), 동기(다가와서 멈춤), 간식 부스(60초 후 사라짐). 동작 트리거는 `eventScheduler` 결과를 따른다.
- [ ] `EndingStage`: NPC 5명 반원 배치, 카메라 경로, 과잠 수여 타임라인(2.5절 Phase 3 엔딩 세부).
- 완료 확인: 빈 평면 위에서 NPC 20명 + 주인공으로 55fps 이상.

### C. HUD & Overlay
- [ ] `Hud` 레이아웃: 왼쪽 위 미니맵(180px) + 스태미나 링, 그 아래 스킬 목록, 오른쪽 위 퀘스트 트래커 + 알림 스택, 오른쪽 아래 음소거. Z-A풍 반투명 흰 패널 + 둥근 모서리, 폰트는 Pretendard.
- [ ] `Minimap`: 맵 윤곽 SVG(건물·잔디·산책로) + 주인공 화살표 + 마커. `logic/minimap.ts`로 좌표 변환, 주인공 방향으로 회전.
- [ ] `DialogueBox`: 이름 탭 + 본문 + ▼, `useTypewriter`(30ms/글자), 글자마다 `beep(pitch)`. Space/클릭으로 진행, 마지막 줄에서 선택지 표시.
- [ ] `audio/beep.ts`: OscillatorNode square파, 40ms, 음높이 ±10% 랜덤.
- [ ] 오프닝: `OpeningSequence`(검은 화면 → 알람 → "…눈을 떴다.") → `PhoneNotice`(문자) → `AdmissionLetter`(풀스크린 합격 통지서) → 독백 → [문을 연다] → 흰 플래시 → phase `explore`. 모든 화면에 [건너뛰기].
- [ ] `SkillAcquired`: 1.8절 FR-5.1 연출 + 팡파르.
- [ ] `SkillDex`: Tab 토글, 20칸 그리드.
- [ ] `EndingSelect`, `JacketCeremony`(UI 텍스트·플래시·꽃가루 레이어), `Credits`.
- 완료 확인: 3D 없이 store 목업만으로 모든 화면을 스토리북처럼 확인할 수 있는 `?ui-preview=1` 페이지.

### D. Minigames
- [ ] `MinigameModal`: 반투명 배경, 제목·설명·[포기], 실패 횟수 표시, 2회 실패 시 힌트. `onSuccess`/`onAbort` 콜백.
- [ ] `logic/minigames/dial.ts`: `angleToVoltage(angle)`, `isLocked(samples, target, tol, holdMs)`. 테스트 먼저.
- [ ] `DialGame`: SVG 다이얼(포인터 드래그로 회전), 멀티미터 디스플레이(7세그먼트풍), 단계 표시.
- [ ] `logic/minigames/trace.ts`: `scoreTrace(drawnPoints, pathPoints, opts) → { coverage, deviation, passed }`. 테스트 먼저.
- [ ] `TraceGame`: 캔버스 640×420, 컵 평면도 점선 경로(몸통 사다리꼴 + 손잡이 반원), [지우기]/[제출].
- [ ] `logic/minigames/fillBlank.ts`, `FillBlankGame`: 타일을 빈칸으로 드래그, 3라운드.
- [ ] `logic/minigames/ordering.ts`, `OrderingGame`: dnd-kit sortable, 단어/코드 모드 스타일 분기, 키보드 센서 활성화(테스트용).
- 완료 확인: `?minigame=dial|trace|fillBlank|ordering-word|ordering-code`로 단독 실행 가능.

### E. Systems & Content
- [ ] `rng.ts`: mulberry32 시드 난수.
- [ ] `questMachine.ts`: `transition(state, event) → state` 순수 함수. 이벤트: `TALK`, `ACCEPT`, `DECLINE`, `SUCCEED`, `ABORT`, `FAIL`. 실패 횟수와 힌트 노출 여부 포함. 5개 클리어 시 `endingUnlocked`.
- [ ] `stamina.ts`: `tickStamina(value, mode, dt, lockedUntil, now)`.
- [ ] `eventScheduler.ts`: `nextEvent(now, lastEvent, rng, phase)`, 45~90초 간격, 연속 중복 금지, explore 외 phase에서는 보류.
- [ ] store 구현부 작성 (리드가 고정한 시그니처 그대로).
- [ ] `data/departments.ts` 20개, `data/npcs.ts` 20명(좌표는 A 트랙의 맵 구역표를 따름), `data/quests.ts` 5개, `data/skills.ts` 20개, `data/events.ts` 3개. 대사는 1.10절을 기반으로 학과당 말풍선 3개 이상, 소개 2~3줄을 작성한다.
- [ ] `debug/devHooks.ts`: `window.__game = { skipOpening, teleportToNextQuest, solveMinigame, grantAllSkills, triggerEvent, getState }` (`?debug=1`일 때만).
- [ ] `DebugKeys.tsx`: FR-11 키 매핑.
- 완료 확인: `tests/unit` 전체 통과, data 무결성 테스트 통과.

### 맵 구역표 (A·B·E 트랙 공유, `config.ts`에 상수로 정의)

```
          북 (바다, 원경)
  ┌───────────────────────────────────┐
  │  [유리 건물]        [12호관]        │
  │   인문·상경 존       공학 존         │
  │   (biz,gts,tax,     (ee★,cse★,ice, │
  │    media,pa,         energy,mech,  │
  │    consumer,neat★)   biorobot,bio) │
  │        ╲   잔디 + 소나무   ╱        │
  │         ╲   ★분수대(엔딩) ╱         │
  │  사범 존              예술·도시 존   │
  │  (histedu,engedu,    (design★,     │
  │   hrd, math★)         urban)       │
  │  ☕커피카트1   ~물결벤치~  ☕커피카트2 │
  │           [시작 지점: 기숙사 문]      │
  └───────────────────────────────────┘
          남
```

★는 퀘스트 NPC이다. 시작 지점에서 첫 퀘스트(Q1, 공학 존)까지는 걸어서 약 20초 거리로 둔다.

## 3.4 병합과 통합 절차

1. 트랙 완료 보고 → 리드가 해당 worktree에서 `tsc`, `vitest`를 다시 실행한다.
2. main에 병합(A → E → B → D → C 순서). 충돌이 나면 소유권 표를 기준으로 해결한다.
3. 병합 후 매번 `npm run dev`로 화면을 열어 콘솔 에러가 없는지 확인한다.
4. Phase 2 완료 시점에 Reviewer 에이전트로 `code-reviewer`를 1회 실행한다(치명 이슈만 수정).

## 3.5 병렬화가 안 되는 구간

- Phase 0(계약 확정)과 Phase 2(통합)는 리드 단독 작업이다.
- Phase 3의 퀘스트 연결은 순서대로 진행하되, 리드가 Q(n)을 통합하는 동안 D/E 에이전트가 Q(n+1)의 데이터와 소품을 미리 준비한다.

## 3.6 병행 트랙 (게임 코드 외, 팀원 담당)

- 트레일러 영상(약 1분): Higgsfield + Claude로 콘티 작성. 컨셉은 넷플릭스 예고편 / 아케인 OST 뮤비 톤, 스토리라인은 "입학 → 방황 → 학과 사람들과의 만남 → 과잠을 받는 순간".
- 발표 자료(3분): 문제 → 해결 → AI 활용 과정(멀티 에이전트 화면, 커밋 그래프) → 시연 연결.
- 게임 화면 녹화: Phase 3 이후부터 트레일러용 클립을 확보한다.

---

# Part 4. 테스트 계획

## 4.1 원칙

- `logic/`의 모든 함수는 **테스트를 먼저 작성**한다(TDD). 이 폴더는 라인 커버리지 95% 이상을 목표로 한다.
- store는 액션 단위로 테스트한다. 3D 렌더링 자체(three.js 내부, R3F 렌더링)는 테스트하지 않는다.
- E2E는 `window.__game` 디버그 훅으로 상태를 조작하고, 사용자 시나리오 핵심 1개(Q4 정렬)는 실제 UI 조작으로 검증한다.
- 테스트 이름 규칙: `{action}_{condition}_{expected}`.
- 매 Phase 종료 조건에 테스트 통과가 포함된다. 테스트 없이 완료를 선언하지 않는다.

## 4.2 실행 명령

```bash
npx tsc --noEmit             # 타입 검사
npx vitest run               # 단위 + 컴포넌트
npx vitest run --coverage    # 커버리지 (logic 95%, 전체 80% 목표)
npx playwright test          # E2E (dev 서버 자동 기동, ?debug=1)
```

## 4.3 단위 테스트 (`tests/unit`)

| 대상 | 테스트 케이스 |
|---|---|
| `minigames/dial` | 각도 0°→0V, 270°→12V; 곡선이 단조 증가; 목표 ±tol 안에서 holdMs 이상 유지하면 LOCK; 중간에 벗어나면 타이머 리셋 |
| `minigames/trace` | 경로와 똑같이 그리면 passed; 절반만 그리면 coverage 부족으로 실패; 엉뚱한 곳에 그리면 deviation 초과로 실패; 빈 입력은 실패 |
| `minigames/fillBlank` | 정답 타일이면 정답; 오답이면 오답; 3라운드 모두 맞혀야 클리어 |
| `minigames/ordering` | 정답 순서면 성공; 한 칸이라도 다르면 실패; 섞기 결과가 정답과 같으면 다시 섞기(시드 고정) |
| `questMachine` | available→offered(TALK)→inProgress(ACCEPT)→cleared(SUCCEED); DECLINE 시 offered 유지; FAIL 2회 후 hintVisible=true; ABORT 시 offered; cleared 상태에서 TALK는 상태 불변; 5개 cleared면 endingUnlocked |
| `stamina` | 달리기 1초에 12 감소; 정지 1초에 4 회복; 0이면 lockedUntil 3초 설정; 최대 100 초과 금지; 걷기는 변화 없음 |
| `eventScheduler` | 시드 고정 시 결과 재현; 간격이 45~90초 범위; 같은 이벤트 연속 금지; explore가 아니면 null |
| `proximity` | 3m 밖이면 null; 여러 대상 중 가장 가까운 것 반환 |
| `minimap` | 월드 원점 → 미니맵 중심; 맵 경계 → 원 테두리; heading 회전 적용 |
| `jacket` | 학과 id로 올바른 JacketSpec 반환; 등판 문구 "INU {학과명} 27" 형식 |
| stores | `useSkillStore.grant` 중복 지급 무시; `useNotificationStore` 최대 3개 유지; `usePlayerStore.setJacket` 반영 |
| data 무결성 | 학과 20개 id 중복 없음; 모든 NPC의 departmentId가 존재; 퀘스트 5개의 npcId·skillId가 존재; obtainable 스킬이 정확히 5개; 모든 NPC barks ≥ 3; 모든 학과에 jacket 스펙 존재; 미니게임 정답이 options/tokens 안에 존재 |

## 4.4 컴포넌트 테스트 (`tests/component`)

| 대상 | 케이스 |
|---|---|
| `DialogueBox` | 클릭하면 타이핑이 즉시 완료됨; 다음 클릭에 다음 줄; 마지막 줄에 선택지 2개 표시; 선택 시 콜백 호출 |
| `OrderingGame` | 키보드 센서로 블록 순서 변경 후 제출 → 성공 콜백; 오답 제출 → 실패 표시 |
| `FillBlankGame` | 정답 선택 시 다음 라운드로 진행; 3라운드 후 성공 콜백 |
| `MinigameModal` | 실패 2회 후 힌트 노출; [포기] 클릭 시 onAbort |
| `SkillList` | 스킬 추가 시 이모지와 이름 렌더링; 새 항목 하이라이트 클래스 |
| `QuestTracker` | "학과 체험 n/5" 갱신 |
| `AdmissionLetter` | "자유전공학부 27학번" 문구 포함 |
| `EndingSelect` | 획득한 5개 학과 카드 표시; 카드 클릭 → 확인 대화 |

## 4.5 E2E 테스트 (`tests/e2e`, Playwright, Chromium)

| 파일 | 시나리오 | 검증 |
|---|---|---|
| `smoke.spec.ts` | 접속 → 오프닝 클릭 진행 → 광장 진입 | canvas 존재, HUD 4요소 표시, 콘솔 에러 0건 |
| `opening.spec.ts` | 문자 클릭 → 합격 통지서 → [문을 연다] | 통지서 문구, phase=explore |
| `q1.spec.ts` | `teleportToNextQuest` → E → 대화 진행 → [도와준다] → `solveMinigame` | 스킬 목록에 📡, 트래커 1/5 |
| `q4-real-ui.spec.ts` | Q4 NPC 대화 → 실제 키보드 드래그로 단어 정렬 → 제출 | 스킬 목록에 🇨🇳 (디버그 해결 없이 실제 UI 검증) |
| `decline.spec.ts` | 대화에서 [다음에] 선택 | 미니게임 미표시, 퀘스트 상태 offered, 이동 가능 |
| `events.spec.ts` | `triggerEvent` 3종 | 알림 문구 표시, 간식 이벤트 후 미니맵 마커 |
| `stamina.spec.ts` | Shift+W를 9초 유지 | 스태미나 링 감소, 0 도달 시 알림 |
| `ending.spec.ts` | `grantAllSkills` → ★ 텔레포트 → 컴퓨터공학부 카드 선택 → 결정 | `getState().player.jacket.backText === 'INU 컴퓨터공학부 27'`, "나의 학과를 찾았다" 문구, 크레딧 도달 |
| `dex.spec.ts` | Tab | 20칸, 획득 칸 수 = 획득 스킬 수 |

## 4.6 성능·시연 점검 (수동)

- r3f-perf로 시연 노트북에서 FPS, draw call(목표 300 이하), 메모리 확인.
- 1280×720, 1920×1080 두 해상도에서 HUD 겹침 확인.
- 오프라인 상태에서 `npm run preview` 동작 확인.
- 처음 보는 사람 1명 블라인드 테스트(성공 기준 5번).

## 4.7 시연 직전 체크리스트

```
[ ] main 최신, 전체 테스트 통과 로그 캡처 (발표 자료용)
[ ] Vercel URL 접속 확인 + 로컬 preview 백업 실행 중
[ ] 브라우저 확대 100%, 전체 화면(F11), 사운드 켜짐
[ ] ?debug=1 탭과 일반 탭을 따로 준비
[ ] 시연 노트북 충전기 연결, 알림 끄기
```

---

# Part 5. 리스크와 컷라인

## 5.1 리스크

| 리스크 | 가능성 | 대응 |
|---|---|---|
| 과잠 텍스처가 캐릭터 UV에 안 맞음 | 중 | Phase 0 스파이크로 조기 판정, 2안/3안 준비 |
| ecctrl 버전 호환 문제 | 중 | 15분 안에 안 되면 Rapier KinematicCharacterController + 자체 카메라로 대체 |
| NPC 20명 스키닝 애니메이션으로 FPS 하락 | 중 | 거리 20m 밖 NPC는 애니메이션 정지, 그림자 끄기 |
| 병합 충돌 | 중 | 파일 소유권, 계약 고정, 병합 순서 |
| 오디오 자동재생 차단 | 높음 | 첫 클릭에서 AudioContext resume |
| 시연장 네트워크 불안정 | 중 | 로컬 preview 빌드 백업, 외부 API 없음 |
| 시간 부족 | 높음 | 5.2절 컷라인 순서대로 덜어냄 |

## 5.2 컷라인 (시간이 부족하면 위에서부터 제거)

1. 분위기 NPC, Q1 배달 로봇 주행 연출
2. 후처리(Bloom/SMAA), 원경 LNG 탱크
3. 교수님 추적 AI → 알림 + 스태미나 감소만 남김
4. 크레딧 상징물 애니메이션 → 텍스트 크레딧
5. 도감(Tab) → 스킬 목록만 유지
6. Q5 → 퀘스트 4개로 축소 (엔딩 조건도 4개로 변경, `config.REQUIRED_SKILLS`)

**절대 지키는 것**: 오프닝 합격 통지서, 3인칭 이동, 말풍선 → 대화 → 미니게임 → 스킬 획득 루프, 과잠 수여 엔딩.

---

# Part 6. 시연 시나리오 (3분)

| 시간 | 장면 | 조작 |
|---|---|---|
| 0:00~0:30 | 오프닝: 눈을 뜸 → 합격 문자 → 합격 통지서 → 문을 열고 광장 등장 | 실제 진행 |
| 0:30~0:50 | 광장 탐색: 학과 말풍선들("서버 또 터졌네…"), 커피 카트 | 실제 이동 |
| 0:50~1:30 | Q1 전자공학부: 대화 → 볼트 맞추기 → 📡 라이다 센서 획득 | 실제 플레이 |
| 1:30~1:45 | 돌발상황: 교수님의 대학원 납치에서 도망 | F6 |
| 1:45~2:15 | Q4 동북아국제통상학부: 중국어 문장 맞추기 → 🇨🇳 획득 | F2 이동 후 실제 플레이 |
| 2:15~2:20 | 나머지 스킬 획득 | F4 |
| 2:20~3:00 | 엔딩: 학과 선택 → 과잠 수여식 → 등판 문구 클로즈업 → "나의 학과를 찾았다." | 실제 진행 |
