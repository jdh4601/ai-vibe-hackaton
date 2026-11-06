import { NPCS } from '../data/npcs';
import { ZONES, type Rect } from '../game/config';
import type { DepartmentId, NpcDef, QuestId } from '../game/types';

const ALL_DEPARTMENTS: DepartmentId[] = [
  'ee', 'design', 'math', 'neat', 'cse', 'biz', 'gts', 'tax', 'media', 'pa',
  'consumer', 'bio', 'biorobot', 'ice', 'energy', 'mech', 'histedu', 'engedu', 'hrd', 'urban',
];
const MOCK_PROPS = ['easel', 'chalkboard', 'serverRack', 'books', 'laptop', 'breadboard', 'beaker'];
const TOTAL = 20;
const MOCK_QUESTS: Partial<Record<DepartmentId, QuestId>> = {
  design: 'q2-design',
  math: 'q3-math',
  neat: 'q4-neat',
  cse: 'q5-cse',
};

// Dev-only: ?mockNpcs=1 pads the real NPC list up to 20 so crowd/perf can be checked before track E lands.
const mockEnabled = (): boolean =>
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mockNpcs') === '1';

function mockNpcs(real: NpcDef[]): NpcDef[] {
  const taken = new Set(real.map((n) => n.departmentId));
  const zones = Object.values(ZONES) as (Rect & { departments: DepartmentId[] })[];
  const extra: NpcDef[] = [];
  const missing = ALL_DEPARTMENTS.filter((d) => !taken.has(d));
  missing.slice(0, TOTAL - real.length).forEach((dept, i) => {
    const zone = zones.find((z) => z.departments.includes(dept)) ?? zones[i % zones.length]!;
    const inZone = missing.filter((d) => zone.departments.includes(d));
    const slot = Math.max(0, inZone.indexOf(dept));
    const col = slot % 3;
    const row = Math.floor(slot / 3);
    extra.push({
      id: `mock-${dept}`,
      departmentId: dept,
      displayName: `선배 ${dept}`,
      position: [zone.x - zone.w / 2 + 6 + col * (zone.w / 3), 0, zone.z - zone.d / 2 + 5 + row * 7],
      rotationY: (i * 1.3) % (Math.PI * 2),
      modelKey: 'student',
      propKeys: [MOCK_PROPS[i % MOCK_PROPS.length]!],
      voicePitch: 200,
      barks: [`${dept} 이야기 1`, `${dept} 이야기 2`, `${dept} 이야기 3`],
      intro: [{ speaker: dept, text: '안녕!' }],
      questId: MOCK_QUESTS[dept],
    });
  });
  return [...real, ...extra];
}

let cached: NpcDef[] | null = null;

// Every NPC the world should render (data/npcs, padded with mocks only in dev with ?mockNpcs=1).
export function getWorldNpcs(): NpcDef[] {
  if (!cached) cached = mockEnabled() ? mockNpcs(NPCS) : NPCS;
  return cached;
}
