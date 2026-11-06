import * as THREE from 'three';
import { zigzagPoints } from './placement';

function makeCanvas(w: number, h = w): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');
  return [c, ctx];
}

function toTexture(c: HTMLCanvasElement, repeatX = 1, repeatY = 1): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Salmon/terracotta brick with wide light zigzag bands and a grid of small dot tiles. One tile = 8m x 8m. */
export function makeBrickTexture(repeat: number): THREE.CanvasTexture {
  const size = 1024;
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = '#c9705a';
  ctx.fillRect(0, 0, size, size);
  const bh = 16;
  const bw = 32;
  for (let r = 0; r * bh < size; r++) {
    for (let col = -1; col * bw < size; col++) {
      const x = col * bw + (r % 2) * (bw / 2);
      const v = ((r * 7 + col * 13) % 5) * 4;
      ctx.fillStyle = `rgb(${205 + v},${118 + v},${96 + v})`;
      ctx.fillRect(x + 1, r * bh + 1, bw - 2, bh - 2);
    }
  }
  // wide light chevron bands: thick pale band with a thinner terracotta core
  const drawBand = (y: number, amp: number, period: number, width: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    zigzagPoints(size, y, amp, period).forEach(([x, py], i) => (i === 0 ? ctx.moveTo(x, py) : ctx.lineTo(x, py)));
    ctx.stroke();
  };
  for (const y of [170, 680]) {
    drawBand(y, 55, 256, 78, '#efc8b4');
    drawBand(y, 55, 256, 30, '#d98b70');
  }
  // small dot tiles on a grid
  for (let gy = 64; gy < size; gy += 128) {
    for (let gx = 64; gx < size; gx += 128) {
      ctx.fillStyle = '#9b4a3a';
      ctx.fillRect(gx - 12, gy - 12, 24, 24);
      ctx.fillStyle = '#f7e6d6';
      ctx.fillRect(gx - 8, gy - 8, 16, 16);
    }
  }
  return toTexture(c, repeat, repeat);
}

export function makeGrassTexture(): THREE.CanvasTexture {
  const size = 256;
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = '#6fb84a';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 1800; i++) {
    const g = 140 + ((i * 53) % 60);
    ctx.fillStyle = `rgba(${80 + (i % 30)},${g},${55 + (i % 20)},0.45)`;
    ctx.fillRect((i * 97) % size, (i * 61) % size, 2, 3);
  }
  return toTexture(c, 4, 6);
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
  const w = 512;
  const h = 512;
  const [c, ctx] = makeCanvas(w, h);
  ctx.fillStyle = o.wall;
  ctx.fillRect(0, 0, w, h);
  const cw = w / o.cols;
  const ch = h / o.rows;
  const ww = o.winW ?? 0.7;
  const wh = o.winH ?? 0.62;
  for (let r = 0; r < o.rows; r++) {
    for (let col = 0; col < o.cols; col++) {
      const x = col * cw + (cw * (1 - ww)) / 2;
      const y = r * ch + ch * 0.2;
      ctx.fillStyle = o.frame ?? 'rgba(0,0,0,0.3)';
      ctx.fillRect(x, y, cw * ww, ch * wh);
      const grad = ctx.createLinearGradient(0, y, 0, y + ch * wh);
      grad.addColorStop(0, o.glass);
      grad.addColorStop(1, '#456780');
      ctx.fillStyle = grad;
      ctx.fillRect(x + 3, y + 3, cw * ww - 6, ch * wh - 6);
    }
  }
  if (o.darkRight) {
    const x0 = w * (1 - o.darkRight);
    ctx.fillStyle = '#4a4f55';
    ctx.fillRect(x0, 0, w - x0, h);
    ctx.fillStyle = '#8fb0a8';
    for (let x = x0 + 10; x < w - 10; x += 22) ctx.fillRect(x, 0, 12, h);
  }
  if (o.louvers) {
    ctx.fillStyle = 'rgba(30,34,38,0.55)';
    for (let y = 0; y < h; y += 14) ctx.fillRect(0, y, w, 5);
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

/** Soft white cloud puff sprite. */
export function makeCloudTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 128);
  for (let i = 0; i < 14; i++) {
    const x = 40 + ((i * 53) % 176);
    const y = 64 + (((i * 37) % 30) - 15);
    const r = 24 + ((i * 11) % 22);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 128);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Tiny equirect sky/ground gradient used as a reflection map so metals do not render black. */
export function makeEnvTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(128, 64);
  const g = ctx.createLinearGradient(0, 0, 0, 64);
  g.addColorStop(0, '#6aa6e0');
  g.addColorStop(0.45, '#e8f1fa');
  g.addColorStop(0.5, '#ffffff');
  g.addColorStop(0.56, '#b98a72');
  g.addColorStop(1, '#7a5a4a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 64);
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Vertical sky gradient for the backdrop dome. */
export function makeSkyTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(4, 256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#2f6fc4');
  g.addColorStop(0.35, '#5b9ce0');
  g.addColorStop(0.5, '#9cc6ee');
  g.addColorStop(0.55, '#b9d8f0');
  g.addColorStop(1, '#b9d8f0');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
