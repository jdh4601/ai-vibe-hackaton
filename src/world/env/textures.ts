import * as THREE from 'three';
import { zigzagPoints } from './placement';

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = c.height = size;
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

/** Red brick plaza with light-pink zigzag bands. One tile = 8m x 8m. */
export function makeBrickTexture(repeat: number): THREE.CanvasTexture {
  const size = 512;
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = '#a9483a';
  ctx.fillRect(0, 0, size, size);
  // brick courses
  const bh = 16;
  const bw = 32;
  for (let r = 0; r * bh < size; r++) {
    for (let col = -1; col * bw < size; col++) {
      const x = col * bw + (r % 2) * (bw / 2);
      const shade = 150 + ((r * 7 + col * 13) % 5) * 7;
      ctx.fillStyle = `rgb(${shade + 20},${shade - 100},${shade - 105})`;
      ctx.fillRect(x + 1, r * bh + 1, bw - 2, bh - 2);
    }
  }
  // pink zigzag bands
  ctx.strokeStyle = '#f3b8c4';
  ctx.lineWidth = 9;
  ctx.lineJoin = 'miter';
  for (const y of [64, 192, 320, 448]) {
    ctx.beginPath();
    zigzagPoints(size, y, 20, 64).forEach(([x, py], i) => (i === 0 ? ctx.moveTo(x, py) : ctx.lineTo(x, py)));
    ctx.stroke();
  }
  return toTexture(c, repeat, repeat);
}

export function makeGrassTexture(): THREE.CanvasTexture {
  const size = 256;
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = '#5f9f45';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 1800; i++) {
    const g = 110 + ((i * 53) % 70);
    ctx.fillStyle = `rgba(${60 + (i % 30)},${g},${50 + (i % 20)},0.5)`;
    ctx.fillRect((i * 97) % size, (i * 61) % size, 2, 3);
  }
  return toTexture(c, 4, 6);
}

export function makePathTexture(): THREE.CanvasTexture {
  const size = 128;
  const [c, ctx] = makeCanvas(size);
  ctx.fillStyle = '#d9b9a4';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#c4a18c';
  ctx.lineWidth = 2;
  for (let i = 0; i <= size; i += 32) {
    ctx.strokeRect(i, 0, 32, size);
  }
  return toTexture(c, 1, 1);
}

/** Facade windows grid. `cols`/`rows` windows across one face. */
export function makeWindowTexture(opts: { wall: string; glass: string; cols: number; rows: number; frame?: string }): THREE.CanvasTexture {
  const w = 512;
  const h = 512;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');
  ctx.fillStyle = opts.wall;
  ctx.fillRect(0, 0, w, h);
  const cw = w / opts.cols;
  const ch = h / opts.rows;
  for (let r = 0; r < opts.rows; r++) {
    for (let col = 0; col < opts.cols; col++) {
      const x = col * cw;
      const y = r * ch;
      ctx.fillStyle = opts.frame ?? 'rgba(0,0,0,0.25)';
      ctx.fillRect(x + cw * 0.15, y + ch * 0.2, cw * 0.7, ch * 0.62);
      const grad = ctx.createLinearGradient(0, y, 0, y + ch);
      grad.addColorStop(0, opts.glass);
      grad.addColorStop(1, '#3d5a73');
      ctx.fillStyle = grad;
      ctx.fillRect(x + cw * 0.19, y + ch * 0.25, cw * 0.62, ch * 0.52);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function makeNumberTexture(text: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');
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
