// Shared contract for every track. Only the lead edits this file.

export type DepartmentId =
  | 'ee' | 'design' | 'math' | 'neat' | 'cse' // quest departments (5)
  | 'biz' | 'gts' | 'tax' | 'media' | 'pa' | 'consumer'
  | 'bio' | 'biorobot' | 'ice' | 'energy' | 'mech'
  | 'histedu' | 'engedu' | 'hrd' | 'urban'; // talk-only departments (15)

export type Vec3 = [number, number, number];

export interface JacketSpec {
  bodyColor: string;
  sleeveColor: string;
  backText: string; // "INU 컴퓨터공학부 27"
}

export interface Department {
  id: DepartmentId;
  name: string;
  emoji: string;
  jacket: JacketSpec;
  symbol: string; // key for credits / building decoration
}

export interface DialogueLine {
  speaker: string;
  text: string;
}

export interface NpcDef {
  id: string;
  departmentId: DepartmentId;
  displayName: string; // "납땜 선배"
  position: Vec3;
  rotationY: number;
  modelKey: string;
  propKeys: string[];
  voicePitch: number; // base beep frequency (Hz)
  barks: string[]; // speech bubbles, at least 3
  intro: DialogueLine[];
  questId?: QuestId;
}

export type QuestId = 'q1-ee' | 'q2-design' | 'q3-math' | 'q4-neat' | 'q5-cse';
export type QuestStatus = 'locked' | 'available' | 'offered' | 'inProgress' | 'cleared';

export interface OrderingToken {
  id: string;
  label: string;
  sub?: string; // pinyin, etc.
}

export type MinigameSpec =
  | { kind: 'dial'; stages: { targetV: number; toleranceV: number; label: string }[]; holdMs: number }
  | { kind: 'trace'; pathId: 'cup'; coverageMin: number; deviationMax: number }
  | { kind: 'fillBlank'; rounds: { sequence: (number | null)[]; options: number[]; answer: number }[] }
  | { kind: 'ordering'; mode: 'word' | 'code'; rounds: { prompt: string; tokens: OrderingToken[]; answer: string[] }[] };

export type MinigameKind = MinigameSpec['kind'];

export interface QuestDef {
  id: QuestId;
  order: 1 | 2 | 3 | 4 | 5;
  departmentId: DepartmentId;
  npcId: string;
  title: string; // "볼트를 맞춰라"
  offer: DialogueLine[]; // ends with "도와줄래?"
  declineLine: string;
  successLines: DialogueLine[];
  thanksLine: string; // talking again after clear
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
  obtainable: boolean; // false → "Coming Soon" in the dex
}

export type GamePhase =
  | 'boot' | 'opening' | 'explore' | 'dialogue' | 'minigame'
  | 'skillAcquired' | 'endingCutscene' | 'endingSelect' | 'jacketCeremony' | 'credits';

export type RandomEventId = 'professorKidnap' | 'assignmentAlert' | 'snackEvent';

export interface RandomEventDef {
  id: RandomEventId;
  icon: string;
  title: string;
  startNotice: string;
  durationMs: number;
}

// ---- quest machine (logic/questMachine.ts) ----

export interface QuestProgress {
  status: QuestStatus;
  failCount: number;
  hintVisible: boolean;
}

export interface QuestMachineState {
  quests: Record<QuestId, QuestProgress>;
  endingUnlocked: boolean;
}

export type QuestEvent =
  | { type: 'TALK'; questId: QuestId }
  | { type: 'ACCEPT'; questId: QuestId }
  | { type: 'DECLINE'; questId: QuestId }
  | { type: 'FAIL'; questId: QuestId }
  | { type: 'SUCCEED'; questId: QuestId }
  | { type: 'ABORT'; questId: QuestId };

// ---- dialogue ----

export type DialogueChoiceId = 'accept' | 'decline';

export interface DialogueChoice {
  id: DialogueChoiceId;
  label: string; // "도와준다" / "다음에"
}

export interface DialogueScript {
  npcId?: string;
  voicePitch: number;
  lines: DialogueLine[];
  choices?: DialogueChoice[]; // shown on the last line
  onEnd?: () => void; // called when the last line is dismissed (no choices)
}

// ---- random events ----

export type MoveMode = 'idle' | 'walk' | 'run';

export interface ActiveEvent {
  id: RandomEventId;
  startedAt: number; // ms (performance.now / Date.now domain used by the store)
  endsAt: number;
  position?: Vec3; // professor spawn / classmate spawn / snack booth
}

export type EventOutcome = 'caught' | 'escaped' | 'reached' | 'expired';

// ---- HUD ----

export interface GameNotification {
  id: number;
  icon?: string;
  text: string;
  createdAt: number;
}

export type MinimapMarkerKind = 'quest' | 'coffee' | 'event' | 'deadline' | 'ending';

export interface MinimapMarker {
  id: string;
  kind: MinimapMarkerKind;
  position: Vec3;
  label?: string;
}

// ---- debug / e2e hooks (window.__game) ----

export interface GameSnapshot {
  phase: GamePhase;
  player: { position: Vec3; heading: number; stamina: number; jacket: JacketSpec };
  quests: Record<QuestId, QuestProgress>;
  endingUnlocked: boolean;
  skills: string[];
  activeEvent: RandomEventId | null;
}

export interface GameDevHooks {
  skipOpening: () => void;
  teleportToNextQuest: () => void;
  teleportTo: (position: Vec3) => void;
  solveMinigame: () => void;
  grantAllSkills: () => void;
  triggerEvent: (id: RandomEventId) => void;
  getState: () => GameSnapshot;
}

declare global {
  interface Window {
    __game?: GameDevHooks;
  }
}
