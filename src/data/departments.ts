import type { Department, DepartmentId } from '../game/types';

// Track E fills all 20 departments.
export const DEPARTMENTS: Department[] = [
  {
    id: 'ee',
    name: '전자공학부',
    emoji: '🔌',
    jacket: { bodyColor: '#0B6E4F', sleeveColor: '#F2C14E', backText: 'INU 전자공학부 27' },
    symbol: 'chip',
  },
];

export const getDepartment = (id: DepartmentId): Department | undefined =>
  DEPARTMENTS.find((d) => d.id === id);
