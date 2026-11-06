import { CanvasTexture, SRGBColorSpace } from 'three';
import { getDepartment } from '../data/departments';
import type { DepartmentId, JacketSpec } from '../game/types';

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
    departmentLine: id,
  };
}

// Back lettering shared by every jacket (plan 1.10 jacket table); departmentLine adds a 4th line.
export function backLines(spec: JacketSpec): string[] {
  const lines = ['INCHEON', 'NATIONAL', 'UNIVERSITY'];
  return spec.departmentLine ? [...lines, spec.departmentLine] : lines;
}

// ---- textures (browser only: these need a 2D canvas) ----

// Torso faces share one aspect: 0.42 m wide x 0.52 m tall.
const W = 512;
const H = 640;
const HEM_H = 88;
const FONT_SANS = '"Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
const FONT_VARSITY = '"Arial Black", "Impact", "Helvetica Neue", Arial, sans-serif';

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D | null] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return [canvas, canvas.getContext('2d')];
}

function toTexture(canvas: HTMLCanvasElement): CanvasTexture {
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Ribbing: body color with two sleeve-colored stripes (blue/white on the hero jacket).
function drawRibbing(ctx: CanvasRenderingContext2D, spec: JacketSpec, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = spec.bodyColor;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = spec.sleeveColor;
  const stripe = h * 0.16;
  ctx.fillRect(x, y + h * 0.2, w, stripe);
  ctx.fillRect(x, y + h * 0.58, w, stripe);
}

function fitText(ctx: CanvasRenderingContext2D, text: string, font: (px: number) => string, px: number, maxW: number): number {
  let size = px;
  ctx.font = font(size);
  while (ctx.measureText(text).width > maxW && size > 16) {
    size -= 2;
    ctx.font = font(size);
  }
  return size;
}

function drawArched(ctx: CanvasRenderingContext2D, spec: JacketSpec): void {
  ctx.fillStyle = spec.sleeveColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // "INCHEON" along an arc across the shoulder blades
  const word = 'INCHEON';
  const radius = 330;
  const cx = W / 2;
  const cy = 150 + radius;
  const span = 1.12; // total radians: arc ≈ 370px, room for 7 letters at 66px without overlap
  ctx.font = `900 66px ${FONT_VARSITY}`;
  for (let i = 0; i < word.length; i++) {
    const t = word.length === 1 ? 0 : -span / 2 + (span * i) / (word.length - 1);
    ctx.save();
    ctx.translate(cx + Math.sin(t) * radius, cy - Math.cos(t) * radius);
    ctx.rotate(t);
    ctx.fillText(word[i]!, 0, 0);
    ctx.restore();
  }
  const lines: [string, number, number][] = [
    ['NATIONAL', 262, 64],
    ['UNIVERSITY', 332, 58],
  ];
  for (const [text, y, px] of lines) {
    fitText(ctx, text, (s) => `900 ${s}px ${FONT_VARSITY}`, px, W - 90);
    ctx.fillText(text, cx, y);
  }
}

// Department name embroidered under the university lettering (ending jackets only).
function drawDepartmentLine(ctx: CanvasRenderingContext2D, spec: JacketSpec): void {
  if (!spec.departmentLine) return;
  ctx.fillStyle = spec.sleeveColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  fitText(ctx, spec.departmentLine, (s) => `800 ${s}px ${FONT_SANS}`, 60, W - 70);
  ctx.fillText(spec.departmentLine, W / 2, 440);
}

// Back of the jacket: body color, hem ribbing and the printed lettering.
export function drawJacketTexture(spec: JacketSpec): CanvasTexture {
  const [canvas, ctx] = makeCanvas(W, H);
  if (ctx) {
    ctx.fillStyle = spec.bodyColor;
    ctx.fillRect(0, 0, W, H);
    drawRibbing(ctx, spec, 0, H - HEM_H, W, HEM_H);
    drawArched(ctx, spec);
    drawDepartmentLine(ctx, spec);
  }
  return toTexture(canvas);
}

// Front of the open jacket: T-shirt strip between two plackets, snaps, pocket welts, hem ribbing.
export function drawJacketFrontTexture(spec: JacketSpec, shirtColor = '#f7f7f4'): CanvasTexture {
  const [canvas, ctx] = makeCanvas(W, H);
  if (ctx) {
    ctx.fillStyle = spec.bodyColor;
    ctx.fillRect(0, 0, W, H);
    const l = 190;
    const r = W - 190;
    // hem ribbing on both panels, then the shirt strip over the middle
    drawRibbing(ctx, spec, 0, H - HEM_H, W, HEM_H);
    ctx.fillStyle = shirtColor;
    ctx.fillRect(l, 0, r - l, H);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(l - 4, 0, 4, H);
    ctx.fillRect(r, 0, 4, H);
    // crew neckline shadow
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.fillRect(l, 0, r - l, 14);
    // snaps
    ctx.fillStyle = spec.sleeveColor;
    for (const y of [60, 170, 280, 390, 500]) {
      for (const x of [l - 22, r + 22]) {
        ctx.beginPath();
        ctx.arc(x, y, 13, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // pocket welts (slanted)
    for (const side of [-1, 1]) {
      const cx = W / 2 + side * 150;
      ctx.save();
      ctx.translate(cx, 420);
      ctx.rotate(side * 0.22);
      ctx.fillRect(-9, -50, 18, 100);
      ctx.restore();
    }
  }
  return toTexture(canvas);
}

// Jacket sides: body color with the hem ribbing.
export function drawJacketSideTexture(spec: JacketSpec): CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, H);
  if (ctx) {
    ctx.fillStyle = spec.bodyColor;
    ctx.fillRect(0, 0, 256, H);
    drawRibbing(ctx, spec, 0, H - HEM_H, 256, HEM_H);
  }
  return toTexture(canvas);
}

// Transparent "27" decal for the wearer's right upper sleeve, printed in the jacket body color.
export function drawSleeveNumberTexture(spec: JacketSpec): CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 160);
  if (ctx) {
    ctx.clearRect(0, 0, 256, 160);
    ctx.fillStyle = spec.bodyColor;
    ctx.font = `900 130px ${FONT_VARSITY}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('27', 128, 86);
  }
  return toTexture(canvas);
}
