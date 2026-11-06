import { CanvasTexture, SRGBColorSpace } from 'three';
import { getDepartment } from '../data/departments';
import type { DepartmentId, JacketSpec } from '../game/types';

export const jacketBackText = (departmentName: string): string => `INU ${departmentName} 27`;

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

// Department jacket, or a deterministic neutral-ish fallback while data for that department is missing.
export function jacketForDepartment(id: DepartmentId): JacketSpec {
  const dept = getDepartment(id);
  if (dept) return dept.jacket;
  const hue = hashString(id) % 360;
  return {
    bodyColor: `hsl(${hue}, 25%, 38%)`,
    sleeveColor: '#E8E8E8',
    backText: jacketBackText(id),
  };
}

// "INU 컴퓨터공학부 27" -> ["INU", "컴퓨터공학부", "27"]; any other shape stays on one line.
export function splitBackText(text: string): string[] {
  const parts = text.trim().split(/\s+/);
  return parts.length === 3 ? parts : [text];
}

const TEX_SIZE = 512;
const FONT = '"Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';

// Back-of-jacket texture: body color, sleeve-color hem/collar stripes, and the printed text.
export function drawJacketTexture(spec: JacketSpec): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = spec.bodyColor;
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
    ctx.fillStyle = spec.sleeveColor;
    ctx.fillRect(0, 0, TEX_SIZE, 36);
    ctx.fillRect(0, TEX_SIZE - 44, TEX_SIZE, 44);
    ctx.fillRect(0, TEX_SIZE - 64, TEX_SIZE, 8);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = splitBackText(spec.backText);
    const three = lines.length === 3;
    const sizes = three ? [120, 70, 120] : [64];
    const ys = three ? [130, 250, 370] : [TEX_SIZE / 2];
    lines.forEach((line, i) => {
      let size = sizes[i] ?? 64;
      ctx.font = `800 ${size}px ${FONT}`;
      while (ctx.measureText(line).width > TEX_SIZE - 60 && size > 20) {
        size -= 4;
        ctx.font = `800 ${size}px ${FONT}`;
      }
      ctx.fillText(line, TEX_SIZE / 2, ys[i] ?? TEX_SIZE / 2);
    });
  }
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
