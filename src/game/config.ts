import type { DepartmentId, Vec3 } from './types';

// World axes: +x = east, -z = north (sea side), y = up. Units are meters.

export const MAP_SIZE = 120; // square plaza, centered at the origin
export const MAP_HALF = MAP_SIZE / 2;

export const SPAWN_POINT: Vec3 = [0, 1, 48]; // dorm door, south edge
export const ENDING_POINT: Vec3 = [0, 0, 0]; // central fountain (★)
export const ENDING_RADIUS = 3;

// player
export const WALK_SPEED = 3.5;
export const RUN_SPEED = 7;
export const CAMERA_DISTANCE = 4.5;
export const CAMERA_HEIGHT = 1.6;
export const PLAYER_POSE_HZ = 10; // how often Player writes position to the store

// interaction
export const BUBBLE_RADIUS = 6;
export const INTERACT_RADIUS = 3;
export const BARK_ROTATE_MS = 8000;

// stamina
export const STAMINA_MAX = 100;
export const STAMINA_RUN_DRAIN = 12; // per second
export const STAMINA_IDLE_REGEN = 4; // per second
export const STAMINA_LOCK_MS = 3000;
export const COFFEE_COOLDOWN_MS = 20_000;

// random events
export const EVENT_MIN_INTERVAL_MS = 45_000;
export const EVENT_MAX_INTERVAL_MS = 90_000;
export const PROFESSOR_CHASE_MS = 8000;
export const PROFESSOR_SPEED = 6;
export const PROFESSOR_CATCH_RADIUS = 1.2;
export const PROFESSOR_STAMINA_PENALTY = 40;
export const SNACK_EVENT_MS = 60_000;

// quests / minigames
export const REQUIRED_SKILLS = 5;
export const HINT_AFTER_FAILS = 2;

// HUD
export const NOTIFICATION_MAX = 3;
export const NOTIFICATION_TTL_MS = 5000;
export const MINIMAP_DIAMETER_PX = 180;
export const MINIMAP_WORLD_RADIUS = 40; // meters shown from center to edge of the minimap

// ---- shared map layout (World renders it, Minimap draws it, data/npcs places into zones) ----

export interface Rect {
  // axis-aligned rectangle on the ground plane
  x: number; // center x
  z: number; // center z
  w: number; // size along x
  d: number; // size along z
}

export interface BuildingDef extends Rect {
  id: string;
  label: string;
  height: number;
  color: string;
}

export const BUILDINGS: BuildingDef[] = [
  { id: 'b12', label: '12호관', x: 28, z: -50, w: 34, d: 12, height: 22, color: '#9aa0a6' },
  { id: 'library', label: '학산도서관', x: -28, z: -50, w: 30, d: 12, height: 16, color: '#8fb8d8' },
  { id: 'stoneWest', label: '인문관', x: -54, z: -8, w: 10, d: 30, height: 14, color: '#d9c7a7' },
  { id: 'stoneEast', label: '공학관', x: 54, z: -8, w: 10, d: 30, height: 14, color: '#d9c7a7' },
];

export const LAWNS: Rect[] = [
  { x: -14, z: -2, w: 18, d: 26 },
  { x: 14, z: -2, w: 18, d: 26 },
];

// diagonal walkways, as ground-plane segments [x1, z1, x2, z2] with width
export const WALKWAYS: { from: [number, number]; to: [number, number]; width: number }[] = [
  { from: [-40, 40], to: [40, -40], width: 4 },
  { from: [40, 40], to: [-40, -40], width: 4 },
  { from: [0, 55], to: [0, -44], width: 6 },
];

export const WAVE_BENCH: Rect = { x: 0, z: 34, w: 30, d: 3 };
export const STAIR_CANOPY: Rect = { x: -30, z: 22, w: 8, d: 6 };

export type ZoneId = 'engineering' | 'humanities' | 'education' | 'artsUrban';

export const ZONES: Record<ZoneId, Rect & { label: string; departments: DepartmentId[] }> = {
  engineering: { label: '공학 존', x: 28, z: -28, w: 36, d: 24, departments: ['ee', 'cse', 'ice', 'energy', 'mech', 'biorobot', 'bio'] },
  humanities: { label: '인문·상경 존', x: -28, z: -28, w: 36, d: 24, departments: ['biz', 'gts', 'tax', 'media', 'pa', 'consumer', 'neat'] },
  education: { label: '사범 존', x: -30, z: 14, w: 32, d: 20, departments: ['histedu', 'engedu', 'hrd', 'math'] },
  artsUrban: { label: '예술·도시 존', x: 30, z: 14, w: 32, d: 20, departments: ['design', 'urban'] },
};

export const COFFEE_CARTS: { id: string; position: Vec3 }[] = [
  { id: 'cart-west', position: [-24, 0, 40] },
  { id: 'cart-east', position: [24, 0, 40] },
];

// semicircle where the five quest NPCs gather for the ending, relative to ENDING_POINT
export const ENDING_GATHER_RADIUS = 5;
