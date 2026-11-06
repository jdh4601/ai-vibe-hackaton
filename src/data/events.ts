import type { RandomEventDef } from '../game/types';
import { PROFESSOR_CHASE_MS, SNACK_EVENT_MS } from '../game/config';

export const EVENTS: RandomEventDef[] = [
  { id: 'professorKidnap', icon: '🎓', title: '교수님의 대학원 납치', startNotice: '교수님이 다가옵니다! 도망치세요!', durationMs: PROFESSOR_CHASE_MS },
  { id: 'assignmentAlert', icon: '📢', title: '동기의 과제 통보', startNotice: '야 너 그거 과제 했어? 오늘까지래!', durationMs: 6000 },
  { id: 'snackEvent', icon: '🍪', title: '간식 나눔 행사', startNotice: '학생회 간식 나눔 행사 중! (60초)', durationMs: SNACK_EVENT_MS },
];
