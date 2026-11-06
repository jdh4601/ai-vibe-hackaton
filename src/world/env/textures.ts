import * as THREE from 'three';
import { mulberry32 } from './rng';

function makeCanvas(w: number, h = w): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');
  return [c, ctx];
}

export interface FacadeOptions {
  wall: string;
  glass: string;
  cols: number;
  rows: number;
  frame?: string;
  winW?: number; // window width fraction of a cell (0..1)
  winH?: number;
  darkRight?: number; // fraction of width at the right drawn as dark grey glass strips
  louvers?: boolean;
}

/** Facade windows grid. */
export function makeWindowTexture(o: FacadeOptions): THREE.CanvasTexture {
  const w = Math.min(1536, o.cols * 96);
  const h = o.rows * 116;
  const [c, ctx] = makeCanvas(w, h);
  const rand = mulberry32(o.cols * 19 + o.rows);
  ctx.fillStyle = o.wall;
  ctx.fillRect(0, 0, w, h);
  const cw = w / o.cols;
  const ch = h / o.rows;
  for (let r = 0; r < o.rows; r++) {
    for (let col = 0; col < o.cols; col++) {
      const left = col * cw;
      const top = r * ch;
      const tower = o.darkRight && col >= o.cols * (1 - o.darkRight);
      const ww = cw * (tower ? 0.95 : o.winW ?? 0.7);
      const wh = ch * (tower ? 0.95 : o.winH ?? 0.62);
      const x = left + (cw - ww) / 2;
      const y = top + (ch - wh) * 0.43;
      // Limestone cladding, horizontal bedding joints and small tonal shifts.
      ctx.fillStyle = `rgba(61,55,45,${rand() * 0.09})`;
      ctx.fillRect(left, top, cw, ch);
      ctx.fillStyle = 'rgba(65,63,55,0.27)';
      ctx.fillRect(left, top, cw, 1.1);
      ctx.fillRect(left, top + ch * 0.5, cw, 0.8);
      ctx.fillRect(left + cw * 0.5, top, 1, ch * 0.5);
      ctx.fillRect(left, top + ch * 0.5, 1, ch * 0.5);
      ctx.fillStyle = '#52585a';
      ctx.fillRect(x - 1.5, y - 1.5, ww + 3, wh + 4);
      const grad = ctx.createLinearGradient(x, y, x + ww * 0.2, y + wh);
      grad.addColorStop(0, tower ? '#586b73' : o.glass);
      grad.addColorStop(0.52, '#879a9d');
      grad.addColorStop(0.58, '#596d71');
      grad.addColorStop(1, '#35454b');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, ww, wh);
      if (rand() < 0.42) {
        const drop = wh * (0.12 + rand() * 0.45);
        ctx.fillStyle = 'rgba(211,204,186,0.68)';
        ctx.fillRect(x, y, ww * 0.5, drop);
        ctx.fillStyle = 'rgba(65,66,62,0.28)';
        for (let sy = 2; sy < drop; sy += 3.4) ctx.fillRect(x, y + sy, ww / 2, 0.8);
      }
      ctx.fillStyle = 'rgba(35,47,50,0.85)';
      ctx.fillRect(x + ww * 0.5, y, 2.1, wh);
      ctx.fillRect(x, y + wh * 0.72, ww, 1.6);
      ctx.fillStyle = 'rgba(237,230,212,0.65)';
      ctx.fillRect(x + ww * 0.5 + 2, y, 1, wh);
      ctx.fillRect(x - 2, y + wh + 2, ww + 4, 2);
      if (o.louvers) {
        ctx.fillStyle = '#718487';
        ctx.fillRect(left, top + ch - 6, cw, 4);
      }
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function makeNumberTexture(text: string): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(512);
  ctx.clearRect(0, 0, 512, 512);
  ctx.fillStyle = '#f5f5f0';
  ctx.font = 'bold 380px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 270);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
