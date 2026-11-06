# 「너의 학과는」 게임 트레일러 제작 기획안

> 러닝타임 60초 · 16:9 1920×1080 · 24fps
> 키워드: 희망참 · 기대 · 설렘 · 몽환 · 청춘
> 제작 도구: Higgsfield(이미지·영상 생성) · ElevenLabs(나레이션) · 편집 툴(CapCut 또는 Premiere)
> 상영 위치: 발표 시작 직후, 시연 바로 앞

---

## 1. 컨셉

### 1.1 로그라인
> 합격은 했다. 그런데 나는 뭘 좋아하는지 모른다. 문을 열자, 학과들이 기다리는 세계가 펼쳐졌다.

### 1.2 연출 의도
- **현실의 막막함 → 꿈꾸는 모험**: 전체를 실사 영화 톤으로 찍는다. 전반부는 차갑고 조용한 새벽 자취방, 문을 여는 순간 따뜻한 골든아워의 캠퍼스로 넘어간다. 질감은 그대로 두고 빛과 색, 화면비만 바꿔서 전환을 만든다. 이 전환이 트레일러 전체에서 가장 큰 감정 포인트다. (2026-11-06 변경: 3D 게임 세계 룩은 AI 느낌이 강해서 폐기)
- **얼굴보다 등**: 주인공은 남자 새내기 한 명으로 고정한다. 다만 결정적인 장면에서는 뒷모습과 과잠 등판을 보여 주어, 게임의 3인칭 뒷모습 시점과 엔딩의 과잠 수여식을 미리 암시한다.
- **제목 장치**: 「너의 이름은」을 오마주한 제목 「너의 학과는」으로 끝난다. 마지막 과잠 등판의 학과명이 슬롯머신처럼 여러 학과로 바뀌다가 빈칸에서 멈추어, 관객에게 "너의 학과는?"이라는 질문을 남긴다.
- **1초의 웃음**: 감동적인 질주 장면이 사실은 교수님에게 쫓기는 장면이었다는 1초짜리 반전으로 심사위원의 웃음을 끌어낸다.

### 1.3 감정 곡선

```
강도
 ▲                         ███████████
 │                      ███           ██
 │                   ███                ██          (여운)
 │              █████                     █  ▁▁▁▁▁▁▁
 │ ▁▁▁▁▁▁▁▁▁▁███                           ▏
 └──────────────────────────────────────────────────▶ 시간
  0s   고요   15s  설렘  27s     폭발      47s  여운  60s
```

| 막 | 구간 | 감정 | 화면 | 음악 |
|---|---|---|---|---|
| 1막 고요 | 0:00–0:15 | 불안, 막막함 | 새벽 자취방, 실사, 차가운 청색 | 피아노만, 작게 |
| 2막 설렘 | 0:15–0:27 | 기대, 두근거림 | 문을 열면 빛 → 골든아워 캠퍼스 광장 | 현악이 쌓이며 상승 |
| 3막 폭발 | 0:27–0:47 | 희망, 청춘의 질주 | 학과 체험 몽타주 | 클라이맥스, 볼륨 최대 |
| 4막 여운 | 0:47–1:00 | 벅참, 질문 | 노을 광장, 과잠 수여, 타이틀 | 순간 정적 → 피아노 아웃트로 |

---

## 2. 스타일 바이블

모든 컷은 이 기준을 따른다. Higgsfield 프롬프트에 해당 막의 스타일 문구를 반드시 붙인다.

### 2.1 막별 룩

| 항목 | 1막 (새벽 자취방) | 2~4막 (골든아워 캠퍼스) |
|---|---|---|
| 질감 | 실사, 35mm 필름, 약한 그레인, 얕은 심도 | 실사, ARRI Alexa 영화 톤, Kodak 필름 그레인 (1막과 같은 질감) |
| 색 | 청회색, 새벽빛, 휴대폰 화면의 차가운 흰빛 | 따뜻한 골든아워, 노을, 벚꽃 분홍 |
| 빛 | 창문 역광, 어둠 속 작은 광원 | 강한 역광, 실제 렌즈 플레어, 빛줄기 속 먼지·꽃잎 (판타지 빛 효과는 쓰지 않음) |
| 화면비 | 2.39:1 레터박스(위아래 검은 띠) | 문이 열리는 순간 띠가 걷히며 16:9 풀프레임 |
| 카메라 | 정적, 느린 푸시인, 핸드헬드 미세 흔들림 | 크레인, 트래킹, 오비트, 슬로모션 |

화면비 전환 장치(레터박스가 열리는 순간)는 편집에서 처리한다. "답답한 현실에서 넓은 세계로"를 화면 자체로 보여 주는 장치다.

### 2.2 공통 스타일 문구 (프롬프트 접미사)

- 1막: `cinematic 35mm film still, shallow depth of field, soft film grain, cold blue dawn light, quiet melancholic mood, Korean university student's small studio room`
- 2~4막: `Photorealistic live-action cinematic film still, real actors, natural skin texture, real fabric, shot on ARRI Alexa with 35mm lens, Kodak film grain, golden hour, natural lens flare, shallow depth of field, not CGI, not 3D render, not illustration`
- 영상 변환 접미사: `Photorealistic live-action, cinematic film look, natural motion, film grain, keep his face and jacket consistent, no text`

### 2.3 주인공: 팀 에셋 기준 (모든 컷의 중심)

주인공은 새로 디자인하지 않는다. 팀이 확정한 에셋을 **모든 생성의 레퍼런스 이미지로 첨부**한다.

| 파일 | 용도 |
|---|---|
| `assets/characters/hero/hero-front-v2.png` | 얼굴·정면 구도 컷(S08, S09~S13)의 기준 |
| `assets/characters/hero/hero-back-v2.png` | 뒷모습 컷(S03, S07, S14, S17)의 기준. 트레일러에서 가장 많이 쓴다 |
| `assets/characters/hero/hero-right-v2.png` | 오른쪽 옆모습. 오른팔 "27"이 보이는 컷(S14 질주, S16) |
| `assets/characters/hero/hero-left-v2.png` | 왼쪽 옆모습. 왼팔에는 아무 표시가 없다 |
| `assets/characters/hero/hero-views-v2-prompts.json` | 에셋을 만든 원본 프롬프트. 외형 문구를 여기서 그대로 가져온다 |
| `assets/references/plaza/plaza-01.jpg`, `plaza-02.jpeg` | 광장 컷(S06, S07, S14, S16)의 배경 레퍼런스 |

`hero-inu-27-turnaround.png`와 `archive/` 폴더의 이전 시안(학교 로고, 양팔 학번, 가방이 있는 버전)은 쓰지 않는다.

**고정 외형 (모든 프롬프트에 포함)**
- 한국인 20세 남자, 헝클어진 검은 머리, 부드러운 미소, 마른 성인 체형
- 로열 블루 몸판 + 흰 소매 과잠, 깃·소맷부리·밑단에 파랑·흰 줄무늬 립, 흰 스냅 단추, 흰 테두리 주머니
- **착용자 기준 오른팔에만** 큰 파란 "27". 왼팔과 가슴은 아무 표시 없음
- 등판: 흰 자수 "INCHEON"(아치형) / "NATIONAL" / "UNIVERSITY"
- 흰 티셔츠, 연청 스트레이트 데님, 흰 스니커즈, **가방 없음**

```
the exact same character as the reference images: Korean young man age 20, tousled
black hair, gentle smile, slim build, royal blue varsity jacket with white sleeves,
blue and white striped ribbing at collar cuffs and hem, white snap buttons, a single
large royal blue "27" only on his right upper sleeve, plain chest, white embroidered
"INCHEON NATIONAL UNIVERSITY" on the back, white t-shirt, light blue straight jeans,
white sneakers, no backpack
```

**막별 변환**
- 2~4막: 1막과 같이 실사 기준 이미지 `hero_live`를 인물 레퍼런스로 쓴다. 뒷모습 컷(S07, S12, S17)은 등판 레터링을 맞추기 위해 `hero-back-v2.png`를 함께 넣는다.
- 1막(실사): 에셋을 레퍼런스로 넣고 "photorealistic live-action version of the same person"으로 실사화한 기준 이미지 `trailer/ref/hero_live.png`를 먼저 하나 만든다. 1막 컷은 이 실사 기준 이미지를 레퍼런스로 쓴다. 얼굴이 에셋과 닮지 않으면 1막은 손·실루엣·뒷모습 위주로 찍어 얼굴 노출을 줄인다.
- 1막의 과잠: 합격 직후 새벽이므로, 과잠은 의자 등받이에 걸려 있다가 S04에서 주인공이 집어 들고 문으로 향한다. 문을 연 뒤(2막부터) 과잠을 입은 모습으로 등장해 "과잠 = 모험의 시작"을 보여 준다.

**좌우 체크**: AI가 좌우를 뒤집기 쉽다. 뒷모습에서는 화면 오른쪽 팔에, 정면에서는 화면 왼쪽 팔에 27이 있어야 한다. 반대로 나온 테이크는 버리거나 편집에서 좌우 반전 후 등판 글자를 다시 합성한다.

### 2.4 반드시 지킬 제작 규칙

1. **글자는 편집에서 넣는다.** AI 영상은 한글을 깨뜨린다. 휴대폰 알림, 합격 통지서, 말풍선, 칠판 숫자, 등판 학과명 줄은 모두 빈 면으로 생성하고 편집 툴에서 합성한다. 등판의 "INCHEON NATIONAL UNIVERSITY"와 팔의 "27"은 에셋 레퍼런스 덕분에 깨끗하게 나오면 그대로 쓰고, 깨지면 합성으로 덮는다.
2. **한 컷 = 한 동작.** 컷당 5초 안팎으로 생성하고, 동작은 하나만 지시한다.
3. **키프레임 이미지 먼저.** 모든 컷은 이미지로 먼저 만들어 구도를 확정한 뒤 영상으로 변환한다(image-to-video).
4. **컷마다 1회만 생성한다** (크레딧 절약). 손가락이나 얼굴이 왜곡된 컷만 다시 만든다. 영상은 Seedance 2.5, 720p, 5초, 오디오 없음으로 만든다.
5. 특정 영화의 장면을 그대로 재현하지 않는다. 빛과 하늘의 분위기만 참고한다.

---

## 3. 나레이션 대본 (주인공 1인칭 독백)

| # | 타임코드 | 대사 | 톤 |
|---|---|---|---|
| N1 | 0:02 | 합격했다. | 담담하게, 숨 섞인 작은 목소리 |
| N2 | 0:06 | 근데… 나는 뭘 좋아하지? | 혼잣말, 끝을 흐리게 |
| N3 | 0:10 | 정해진 길도, 정답도 없었다. | 조용하지만 단단하게 |
| N4 | 0:13 | 그래서, 문을 열었다. | 속삭임 → 결심 |
| N5 | 0:23 | 이 세계 어딘가에, 내 이야기가 있을까. | 설렘, 미소가 묻어나게 |
| — | 0:27–0:47 | (나레이션 없음, 음악이 말한다) | |
| N6 | 0:52 | 나의 학과는— | 벅차서 말을 멈추듯 |
| N7 | 0:57 | 너의 학과는, 뭐야? | 관객에게 건네는 질문, 따뜻하게 |

총 7줄, 약 60자이다. 음악이 주인공이 되도록 나레이션 분량을 일부러 적게 잡았다.

### 3.1 ElevenLabs 설정
- 보이스: 20대 초반 한국어 남성, 부드럽고 숨소리가 섞인 톤. Voice Library에서 "young Korean male, soft, calm" 조건으로 3개를 골라 N2로 비교 청취한 뒤 결정한다. 마음에 드는 보이스가 없으면 Voice Design으로 생성한다.
- 모델: 한국어 지원 모델 중 감정 표현이 가장 좋은 최신 모델을 쓴다. 오디오 태그를 지원하는 모델이면 N1·N4에 `[whispers]`, N6에 `[breathless]`를 붙여 시험한다.
- 설정 시작값: Stability 40 / Similarity 75 / Style 30. 너무 연기톤이면 Style을 낮춘다.
- 줄마다 따로 생성하고, 줄마다 3테이크 이상 뽑아 고른다. 파일명: `N1_take2.wav`.
- 후처리: 약한 리버브(작은 방), 1막 대사는 고역을 살짝 깎아 내면의 목소리처럼 만든다.

---

## 4. 음악 계획

### 4.1 메인 트랙
- 곡: RADWIMPS 「スパークル(Sparkle)」 (영화 「너의 이름은」 OST)
- 원곡이 약 9분이므로 세 구간을 잘라 붙인다. 구간 선택은 편집자가 원곡을 듣고 확정한다.

| 사용 구간 | 원곡에서 고를 부분 | 트레일러 위치 | 처리 |
|---|---|---|---|
| [A] 인트로 | 피아노만 나오는 도입부 | 0:00–0:15 | 볼륨 -18dB, 나레이션 아래 깔기 |
| [B] 빌드업 | 악기가 쌓이기 시작하는 부분 | 0:15–0:27 | -12dB에서 -4dB로 서서히 상승 |
| [C] 클라이맥스 | 밴드와 현악이 가장 크게 터지는 부분 | 0:27–0:47 | **0dB, 볼륨 최대.** 나레이션 없음 |
| [D] 아웃트로 | 클라이맥스 이후 피아노가 남는 부분 | 0:48–1:00 | -10dB, 페이드아웃 |

- 0:47에 0.5초 동안 **완전한 정적**을 넣는다(과잠이 어깨에 걸리는 순간). 이 정적 직후 [D]가 들어오면서 감정이 터진다.
- 구간 사이 이음새는 박자에 맞춰 자르고, 리버브 꼬리나 화이트 플래시 효과음으로 가린다.

### 4.2 저작권 메모와 대체 트랙
- 원곡은 상업 음원이다. 발표장 상영은 진행하되, 유튜브·SNS에 업로드하면 저작권 신고로 음소거·차단될 수 있다.
- 온라인 공개용으로 같은 구조의 대체 BGM을 AI 음악 생성 도구로 하나 만들어 둔다.

```
Cinematic Japanese anime film score, solo piano intro, gentle and nostalgic,
builds with strings and soft drums, explodes into an emotional rock band and
orchestra climax with soaring strings, then returns to a lone piano outro.
Hopeful, dreamy, youthful, sparkling. 60 seconds. Instrumental.
```

### 4.3 효과음 (SFX)

| 타임코드 | 효과음 |
|---|---|
| 0:00 | 휴대폰 진동 2회 |
| 0:04 | 종이 펼치는 소리 |
| 0:12 | 문손잡이 돌리는 금속음 |
| 0:15 | 문이 열리는 바람 소리 + 화이트 플래시 "쉭" |
| 0:17 | 광장 환경음(웅성거림, 새소리), 말풍선 "띠리리" 비프음 |
| 0:27~ | 컷마다 학과 사운드: 납땜 지직, 붓 스윽, 분필 탁, 키보드 연타, 서버 비프 |
| 0:44 | 스킬 획득 차임 5연타 (음 높이 상승) |
| 0:47 | 정적 0.5초 |
| 0:48 | 천 스치는 소리(과잠이 어깨에 걸림) |
| 0:55 | 타이틀 등장 저음 "붐" + 반짝이 소리 |

### 4.4 믹싱 기준
- 나레이션이 나오는 동안 음악을 -6dB 추가로 낮춘다(덕킹).
- 최종 라우드니스 -14 LUFS, 피크 -1dBTP.
- 발표장 스피커에서 반드시 한 번 미리 틀어 본다.

---

## 5. 샷 리스트 (18컷)

표기: **[I]** = 키프레임 이미지 프롬프트, **[V]** = 영상 변환 시 동작·카메라 지시, **[T]** = 편집에서 합성할 텍스트.

### 1막 고요 (0:00–0:15) · 실사 · 레터박스

**S01 · 0:00–0:04 · 휴대폰 알림**
- [I] `Dark small studio room before dawn, a smartphone lying face-up on a cluttered desk next to a cold cup of instant coffee, the screen glows and softly lights the desk, blue hour light from the window` + 1막 접미사
- [V] 화면이 켜지며 진동, 아주 느린 푸시인
- [T] 알림: "[인천대학교] 2027학년도 신입생 합격을 축하합니다"
- 나레이션 N1 "합격했다."

**S02 · 0:04–0:08 · 합격 통지서**
- [I] `Close-up of a young man's hands unfolding an official university admission letter, blank paper with an emblem, warm desk lamp against cold room` + 1막 접미사
- [V] 손이 종이를 펼침, 얕은 심도에서 초점 이동
- [T] "인천대학교 자유전공학부 27학번 — 입학을 축하합니다"
- 나레이션 N2 "근데… 나는 뭘 좋아하지?"

**S03 · 0:08–0:12 · 창가의 뒷모습**
- [I] (레퍼런스: `hero_live.png`) `Back view of the same young man in a plain white t-shirt standing at a window, looking at a distant city skyline and sea at dawn, a royal blue varsity jacket with white sleeves hangs on the chair beside him, silhouette` + 1막 접미사
- [V] 정적 롱테이크, 창밖 구름만 천천히 흐름
- 나레이션 N3 "정해진 길도, 정답도 없었다."

**S04 · 0:12–0:15 · 문손잡이**
- [I] `Close-up of a hand holding a royal blue varsity jacket with white sleeves, the other hand on a door handle in a dark hallway, bright warm golden light leaking through the gap under and around the door` + 1막 접미사
- [V] 과잠을 쥔 채 손잡이를 돌림, 문틈 빛이 점점 강해짐
- 나레이션 N4 "그래서, 문을 열었다."

### 2막 설렘 (0:15–0:27) · 캠퍼스 진입 · 레터박스 해제

**S05 · 0:15–0:18 · 빛 속으로 (전환 컷)**
- [I] 시작 프레임: S04의 문이 열린 상태. 끝 프레임: S06 실사 광장 항공샷
- [V] 카메라가 문틈의 빛 속으로 빠르게 돌진 → 화이트아웃 → 광장 상공으로 빠져나옴. Higgsfield에서 시작·끝 프레임을 지정하는 방식으로 생성한다. 실패하면 두 컷을 화이트 플래시로 잇는다.
- 편집: 이 순간 레터박스가 위아래로 열린다.

**S06 · 0:18–0:22 · 광장 전경 크레인샷**
- [I] `Aerial establishing shot of a sunny university plaza by the sea, red brick paving with zigzag pattern, green lawns with pine trees, a wave-shaped silver bench sculpture, modern grey campus buildings, ocean on the horizon, cherry blossoms, students gathering in small groups` + 2~4막 접미사
- [V] 하늘에서 천천히 하강하는 크레인샷, 벚꽃잎이 화면 앞을 지나감
- 참고: 인천대 12호관 앞 광장 사진의 구도(붉은 벽돌 지그재그 바닥, 물결 벤치)를 레퍼런스 이미지로 함께 넣는다.

**S07 · 0:22–0:25 · 3인칭 뒷모습 트래킹**
- [I] (레퍼런스: `hero-back-v2.png`, `plaza-01.jpg`) `Over-the-shoulder third-person view behind the live-action freshman (the exact same character as the reference, back lettering INCHEON NATIONAL UNIVERSITY visible), walking into the bustling plaza, students from different majors doing activities: one soldering a small robot, one sketching on an easel, one writing on a chalkboard` + 2~4막 접미사
- [V] 주인공 뒤를 따라가는 트래킹, 게임의 3인칭 시점과 같은 높이
- [T] 학생들 머리 위 말풍선: "서버 또 터졌네…", "오늘도 야작각이네…", "증명 끝… 아 아니네"
- SFX 말풍선 비프음 "띠리리"

**S08 · 0:25–0:27 · 하늘을 올려다봄**
- [I] `Low angle shot of the the live-action freshman looking up at a dreamy sky full of glowing clouds and light streaks, petals swirling around him, gentle smile` + 2~4막 접미사
- [V] 로우앵글 오비트 반 바퀴
- 나레이션 N5 "이 세계 어딘가에, 내 이야기가 있을까." (0:23부터 S07 위로 시작)

### 3막 폭발 (0:27–0:47) · 학과 체험 몽타주 · 음악 최대

컷 길이는 박자에 맞춰 2~3초로 빠르게 자른다. 각 컷에는 학과를 상징하는 "마법 같은 순간"을 하나씩 넣는다.

**S09 · 0:27–0:30 · 전자공학부**
- [I] `the live-action freshman and a senior engineering student soldering a small delivery robot with a lidar sensor on its head, bright sparks flying, the lidar emits rotating blue laser lines that sweep across the plaza` + 2~4막 접미사
- [V] 불꽃이 튀는 순간 슬로모션, 라이다 레이저가 화면을 가로지름

**S10 · 0:30–0:33 · 디자인학부**
- [I] `The freshman tracing a glowing line in mid-air that forms the outline of a coffee mug, the line blooms into vivid colors and swirling brush strokes like a living painting` + 2~4막 접미사
- [V] 빛나는 선이 컵 모양을 완성하며 색이 번짐

**S11 · 0:33–0:36 · 수학과**
- [I] `Chalk numbers lifting off a blackboard and floating in a golden spiral around the freshman, geometric shapes and a protractor glowing in the air` + 2~4막 접미사
- [V] 숫자들이 칠판에서 떠올라 나선으로 회전
- [T] 떠오르는 숫자: 2 · 6 · 18 · 54 · 162

**S12 · 0:36–0:39 · 동북아국제통상학부**
- [I] `Glowing characters floating like a constellation above a harbor at sunset with container ships and cranes, the freshman reaching out to arrange them` + 2~4막 접미사
- [V] 글자들이 주인공 손짓에 맞춰 한 줄로 정렬됨
- [T] 정렬되는 글자: 我 是 学生 (AI 생성 글자 대신 합성)

**S13 · 0:39–0:42 · 컴퓨터공학부**
- [I] `A wall of server racks with blinking red LEDs at night on the plaza, the freshman typing on a laptop, the LEDs turn green in a wave from left to right` + 2~4막 접미사
- [V] LED가 빨강에서 초록으로 물결처럼 바뀜
- [T] 노트북 화면: `200 OK`

**S14 · 0:42–0:44 · 질주 + 코믹 반전 (1초)**
- 앞 1초(감동): 주인공이 벚꽃잎과 빛 입자를 가르며 슬로모션으로 달린다. 관객은 "청춘의 질주"라고 받아들인다.
- 뒤 1초(반전): 카메라가 빠지며 주인공 바로 뒤에서 **교수님이 전력으로 쫓아오고 있다**는 것이 드러난다. 0.3초 프리즈 프레임과 함께 자막을 띄운다.
- [I-1] `The freshman running across the red brick plaza at golden hour, jacket flapping, petals and light particles streaming behind him, side tracking shot` + 2~4막 접미사
- [I-2] `Wide shot revealing a middle-aged professor in a cardigan and glasses sprinting right behind the running freshman, holding a stack of papers, comically determined expression, same golden hour plaza` + 2~4막 접미사
- [V] I-1을 슬로모션 트래킹으로 생성하고, I-2를 줌아웃으로 생성해 하드컷으로 붙인다.
- [T] 프리즈 프레임 자막(게임 알림창 스타일): "🎓 돌발상황: 교수님의 대학원 납치"
- 사운드: 반전 순간 음악은 그대로 유지하고, "뚝" 하는 레코드 스크래치 대신 **게임 알림음** 하나만 얹는다. 음악을 끊지 않아야 곧바로 S15의 감동으로 돌아갈 수 있다.
- 의도: 심사위원(교수진)의 웃음을 1초 만에 끌어내고, 감정 흐름은 끊지 않는다.

**S15 · 0:44–0:47 · 스킬 도감 완성**
- [I] `Five glowing emblems orbiting around the freshman like a constellation: a radar dish, a paintbrush, a protractor, a scroll, a penguin, forming a circle of light` + 2~4막 접미사
- [V] 다섯 개의 빛이 하나씩 켜지며 원을 완성, 마지막에 빛이 폭발
- [T] 이모지 아이콘 📡 🎨 📐 🇨🇳 🐧 을 하나씩 팝업 (차임 5연타와 동기화)

### 4막 여운 (0:47–1:00) · 노을 · 과잠 수여

**S16 · 0:47–0:53 · 과잠 수여**
- [I] `Sunset at the plaza fountain, five senior students in a semicircle, one senior gently placing a new varsity jacket on the freshman's shoulders, warm backlight, petals frozen in the air` + 2~4막 접미사
- [V] 0:47 정적과 함께 슬로모션, 과잠이 어깨에 걸리는 순간 음악 재진입
- 나레이션 N6 "나의 학과는—"

**S17 · 0:53–0:57 · 등판 클로즈업**
- [I] `Back view close-up of the freshman wearing a new varsity jacket, large blank area on the back for lettering, sunset sky and sea in the background, camera slowly rising` + 2~4막 접미사
- [V] 카메라가 등 뒤에서 천천히 상승하며 하늘로 틸트업
- [I] 레퍼런스: `hero-back-v2.png`. 새 과잠은 학과 색으로 바뀌지만, 등판 "INCHEON / NATIONAL / UNIVERSITY"와 오른팔 "27"은 유지하고 **"UNIVERSITY" 아래에 빈 공간**을 남겨 생성한다.
- [T] 등판 4번째 줄("UNIVERSITY" 아래) 학과명 슬롯머신 연출 (편집에서 합성, 원근에 맞춰 등판에 트래킹):
  - 0:53.0~0:55.0 학과명이 빠르게 바뀐다. 처음에는 0.25초 간격으로 시작해 점점 빨라진다.
    `전자공학부 → 디자인학부 → 수학과 → 동북아국제통상학부 → 컴퓨터공학부 → 경영학부 → 기계공학과 → 미디어커뮤니케이션학과 → 생명공학과 → …`
  - 0:55.0~0:55.6 0.05초 간격으로 거의 흐릿하게 돌아간다. 효과음은 "타다다닥" 하는 플립 보드 소리.
  - 0:55.6 **빈칸에서 멈춘다** → "INCHEON / NATIONAL / UNIVERSITY / ＿＿＿＿", 효과음 "틱".
  - 0:56~ 빈칸 밑줄이 한 번 빛나며 N7 "너의 학과는, 뭐야?"로 이어진다.
- 의도: 20개 학과의 다양성을 2초 안에 보여 주고, 마지막 빈칸으로 관객에게 질문을 넘긴다.
- 나레이션 N7 "너의 학과는, 뭐야?" (0:57에 타이틀 카드 위로 이어짐)

**S18 · 0:57–1:00 · 타이틀 카드**
- 배경: S17의 하늘이 흐려지며 빛 입자만 남음
- [T] 메인 타이틀 **「너의 학과는」**, 아래 작은 부제 "자유전공학부 새내기의 학과 탐색 오픈월드"
- [T] 마지막 1초: "지금, 플레이합니다." → 발표자가 바로 시연으로 넘어간다.
- 타이틀 폰트: 명조 계열(예: 나눔명조 ExtraBold)에 흰색, 약한 글로우. 원작 영화의 로고 디자인은 따라 하지 않는다.

---

## 6. 제작 워크플로

```
① 실사 기준 이미지 → ② 키프레임 이미지 18장 → ③ 영상 변환(컷당 1테이크, 720p)
   → ④ 나레이션 생성 → ⑤ 음악 구간 편집 → ⑥ 러프컷 → ⑦ 텍스트·SFX·색보정 → ⑧ 최종 출력
```

| 단계 | 작업 | Higgsfield에서 쓸 기능 | 산출물 |
|---|---|---|---|
| ① | 팀 에셋 4방향을 캐릭터 레퍼런스로 등록, 1막용 실사 기준 이미지 생성 | 캐릭터 일관성 기능(에셋 4장 업로드) + 이미지 생성 | 캐릭터 등록 완료, `ref/hero_live.png` |
| ② | 컷별 키프레임 생성, 구도 확정 | 이미지 생성 (캐릭터 레퍼런스 적용) | `frames/S01.png` … `S18.png` |
| ③ | 이미지 → 영상 변환 | image-to-video, 카메라 무브 프리셋, 시작·끝 프레임 지정(S05) | `shots/S01_t1.mp4` … |
| ④ | 나레이션 7줄 생성 | (ElevenLabs) | `vo/N1_take2.wav` … |
| ⑤ | Sparkle 구간 4개 자르기 | (편집 툴) | `music/sparkle_cut.wav` |
| ⑥ | 컷 배치, 음악 박자 맞추기 | (편집 툴) | `edit/rough_v1` |
| ⑦ | 텍스트 합성, 레터박스, SFX, 색보정, 덕킹 | (편집 툴) | `edit/fine_v1` |
| ⑧ | 1080p H.264 출력, 라우드니스 확인 | (편집 툴) | `export/trailer_final.mp4` |

Higgsfield MCP를 연결하면 먼저 사용 가능한 모델·카메라 프리셋 목록을 확인하고, 위 표의 기능 이름을 실제 도구 이름으로 바꿔 진행한다.

### 6.1 파일 구조

```
trailer/
├── ref/       # 1막 실사 기준 이미지 (주인공 원본은 assets/characters/hero/)
├── frames/    # 키프레임 이미지
├── shots/     # 생성된 영상 테이크
├── vo/        # 나레이션
├── music/     # 원곡 컷, 대체 BGM
├── sfx/
├── edit/      # 편집 프로젝트
└── export/
```

### 6.2 일정 (발표 전 완성 기준)

| 시간 | 작업 | 완료 조건 |
|---|---|---|
| 0:00–0:20 | ① 에셋 등록, 실사 기준 이미지 | 에셋과 같은 인물로 보이는 실사 이미지 확정 |
| 0:20–0:50 | ② 키프레임 18장 | 전 컷 구도 확정 (컷당 2~3장 중 선택) |
| 0:50–1:40 | ③ 영상 변환 | 전 컷 사용 가능한 테이크 1개 이상 |
| 0:50–1:10 | ④ ⑤ 나레이션·음악 (③과 병행) | VO 7줄, 음악 컷 확정 |
| 1:40–2:10 | ⑥ ⑦ 편집 | 파인컷 완성 |
| 2:10–2:20 | ⑧ 출력, 발표장 스피커 테스트 | 최종 파일 + USB 백업 |

시간이 부족하면 다음 순서로 줄인다: S14의 슬로모션 질주 1초를 빼고 교수님 반전 1초만 남김 → S12·S13을 한 컷으로 합침 → S05 전환 컷을 화이트 플래시로 대체. **S01~S04, S07, S15~S18은 끝까지 지킨다.**

---

## 7. 품질 체크리스트

```
[ ] 모든 컷에서 주인공이 hero-*-v2.png 에셋과 같은 사람·같은 과잠으로 보인다
[ ] 27은 오른팔에만 있고, 가방이 등장하지 않는다
[ ] 화면 속 깨진 글자가 없다 (텍스트는 전부 편집 합성)
[ ] 손가락, 얼굴 왜곡이 있는 테이크가 없다
[ ] 레터박스가 S05에서 열린다
[ ] 3막 컷 전환이 음악 박자와 맞는다
[ ] 0:47 정적 → 과잠 → 음악 재진입이 정확하다
[ ] 나레이션이 음악에 묻히지 않는다 (덕킹 확인)
[ ] 등판 학과명이 슬롯머신처럼 바뀌다가 빈칸에서 멈추고, 타이틀 「너의 학과는」이 선명하다
[ ] S14 코믹 반전에서 음악이 끊기지 않는다
[ ] -14 LUFS, 1080p, 정확히 60초
[ ] 발표장 스피커·프로젝터에서 미리 재생해 봤다
```

---

## 8. 결정 기록

| 항목 | 결정 |
|---|---|
| 타이틀 | 「너의 학과는」 |
| 비주얼 | 전체 실사 영화 톤. 1막 새벽 청색 → 2~4막 골든아워 (3D 게임 룩은 AI 느낌이 강해 폐기, 2026-11-06) |
| 주인공 | 팀 에셋 `hero-*-v2.png`가 기준. 1막 실사 이미지는 이 에셋으로 AI 생성 |
| 나레이션 | 주인공 1인칭 독백, ElevenLabs로 생성 |
| 감정 곡선 | 고요 → 설렘 → 폭발 → 여운 |
| BGM | RADWIMPS 「スパークル」, 클라이맥스 구간 볼륨 최대 (온라인 공개용 대체 트랙 별도 준비) |
| 코믹 컷 | 3막 S14에 1초 (교수님의 대학원 납치) |
| 등판 문구 | 학과명이 슬롯머신처럼 바뀌다가 빈칸에서 멈춤 |
| 실제 게임 화면 | 넣지 않음, 시연에서 공개 |
