export interface Point {
  x: number;
  y: number;
}

export interface TraceOptions {
  coverageRadius?: number;
  deviationRadius?: number;
  coverageMin: number;
  deviationMax: number;
}

export interface TraceScore {
  coverage: number;
  deviation: number;
  passed: boolean;
}

export const TRACE_W = 640;
export const TRACE_H = 420;

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Resample a polyline so consecutive points are at most `step` apart. */
export function densify(points: Point[], step = 4): Point[] {
  if (points.length < 2) return points.slice();
  const out: Point[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const n = Math.max(1, Math.ceil(dist(a, b) / step));
    for (let k = 1; k <= n; k++) out.push({ x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n });
  }
  return out;
}

function nearest(p: Point, set: Point[]): number {
  let best = Infinity;
  for (const q of set) {
    const d = dist(p, q);
    if (d < best) best = d;
  }
  return best;
}

/** Like scoreTrace, but strokes are densified separately so pen lifts are not bridged. */
export function scoreTraceStrokes(strokes: Point[][], path: Point[], opts: TraceOptions): TraceScore {
  return scoreDense(strokes.flatMap((s) => densify(s)), path, opts);
}

export function scoreTrace(drawn: Point[], path: Point[], opts: TraceOptions): TraceScore {
  return scoreDense(densify(drawn), path, opts);
}

function scoreDense(d: Point[], path: Point[], opts: TraceOptions): TraceScore {
  const coverageRadius = opts.coverageRadius ?? 12;
  const deviationRadius = opts.deviationRadius ?? 25;
  if (d.length === 0 || path.length === 0) return { coverage: 0, deviation: 1, passed: false };
  const covered = path.filter((p) => nearest(p, d) <= coverageRadius).length;
  const off = d.filter((p) => nearest(p, path) >= deviationRadius).length;
  const coverage = covered / path.length;
  const deviation = off / d.length;
  return { coverage, deviation, passed: coverage >= opts.coverageMin && deviation <= opts.deviationMax };
}

/** Cup plan strokes: trapezoid body (closed) and a semicircle handle, in a 640x420 canvas. */
export function cupStrokes(): Point[][] {
  const body = densify(
    [
      { x: 200, y: 110 },
      { x: 400, y: 110 },
      { x: 370, y: 330 },
      { x: 230, y: 330 },
      { x: 200, y: 110 },
    ],
    6,
  );
  const handle: Point[] = [];
  const cx = 392;
  const cy = 215;
  const r = 62;
  const steps = 28;
  for (let i = 0; i <= steps; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / steps;
    handle.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return [body, densify(handle, 6)];
}

export function cupPath(): Point[] {
  return cupStrokes().flat();
}
