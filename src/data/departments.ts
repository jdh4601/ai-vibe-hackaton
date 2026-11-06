import type { Department, DepartmentId } from '../game/types';

const dept = (
  id: DepartmentId,
  name: string,
  emoji: string,
  bodyColor: string,
  sleeveColor: string,
  symbol: string,
): Department => ({ id, name, emoji, symbol, jacket: { bodyColor, sleeveColor, backText: `INU ${name} 27` } });

// Quest departments use the colors from plan 1.10 (jacket table); the rest are invented.
export const DEPARTMENTS: Department[] = [
  dept('ee', '전자공학부', '🔌', '#0B6E4F', '#F2C14E', 'chip'),
  dept('design', '디자인학부', '🎨', '#E94F37', '#FFFFFF', 'brush'),
  dept('math', '수학과', '📐', '#3B5BA9', '#F4F4F4', 'protractor'),
  dept('neat', '동북아국제통상학부', '🇨🇳', '#8C1C13', '#F2D0A4', 'scroll'),
  dept('cse', '컴퓨터공학부', '💻', '#111111', '#39FF14', 'terminal'),
  dept('biz', '경영학부', '💼', '#1B365D', '#C9A227', 'chart'),
  dept('gts', 'Global Trade & Service학부', '🚢', '#0E7C86', '#FFFFFF', 'ship'),
  dept('tax', '세무회계학과', '🧾', '#5B3A29', '#E8D8B9', 'calculator'),
  dept('media', '미디어커뮤니케이션학과', '🎥', '#6A1B9A', '#FFD54F', 'camera'),
  dept('pa', '행정학과', '🏛️', '#37474F', '#B0BEC5', 'pillar'),
  dept('consumer', '소비자학과', '🛒', '#D9657F', '#FFFFFF', 'cart'),
  dept('bio', '생명공학부', '🧬', '#2E7D32', '#C5E1A5', 'dna'),
  dept('biorobot', '바이오-로봇시스템공학과', '🦾', '#455A64', '#FF7043', 'robotArm'),
  dept('ice', '정보통신공학과', '📶', '#0277BD', '#B3E5FC', 'antenna'),
  dept('energy', '에너지화학공학과', '🔋', '#F9A825', '#212121', 'beaker'),
  dept('mech', '기계공학과', '⚙️', '#B71C1C', '#CFD8DC', 'gear'),
  dept('histedu', '역사교육과', '📜', '#6D4C41', '#FFE0B2', 'map'),
  dept('engedu', '영어교육과', '🗽', '#1A237E', '#FFCDD2', 'book'),
  dept('hrd', '창의인재개발학과', '🧠', '#00897B', '#FFF59D', 'bulb'),
  dept('urban', '도시행정학과', '🏙️', '#546E7A', '#FFAB40', 'drone'),
];

export const getDepartment = (id: DepartmentId): Department | undefined =>
  DEPARTMENTS.find((d) => d.id === id);
