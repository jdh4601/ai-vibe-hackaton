import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { TRACE_H, TRACE_W, cupStrokes, scoreTraceStrokes } from '../../logic/minigames/trace';
import type { Point, TraceScore } from '../../logic/minigames/trace';
import type { GameProps } from './gameProps';
import './minigames.css';

const toD = (pts: Point[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
const pct = (n: number) => `${Math.round(n * 100)}%`;

export function TraceGame({ spec, hintVisible, onSuccess, onFail }: GameProps<'trace'>) {
  const strokes = useMemo(() => cupStrokes(), []);
  const path = useMemo(() => strokes.flat(), [strokes]);
  const [drawn, setDrawn] = useState<Point[][]>([]);
  const [score, setScore] = useState<TraceScore | null>(null);
  const drawing = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const locate = (e: ReactPointerEvent): Point => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return { x: e.clientX, y: e.clientY };
    return { x: ((e.clientX - r.left) * TRACE_W) / r.width, y: ((e.clientY - r.top) * TRACE_H) / r.height };
  };
  const passed = score?.passed === true;

  const onDown = (e: ReactPointerEvent) => {
    if (passed) return;
    svgRef.current?.setPointerCapture?.(e.pointerId);
    drawing.current = true;
    setScore(null);
    setDrawn((d) => [...d, [locate(e)]]);
  };
  const onMove = (e: ReactPointerEvent) => {
    if (!drawing.current) return;
    const p = locate(e);
    setDrawn((d) => {
      if (d.length === 0) return d;
      const last = d[d.length - 1];
      return [...d.slice(0, -1), [...last, p]];
    });
  };
  const onUp = () => {
    drawing.current = false;
  };

  const submit = () => {
    if (passed) return;
    const s = scoreTraceStrokes(drawn, path, { coverageRadius: 12, deviationRadius: 25, coverageMin: spec.coverageMin, deviationMax: spec.deviationMax });
    setScore(s);
    if (s.passed) timer.current = setTimeout(onSuccess, 1100);
    else onFail();
  };
  const clear = () => {
    if (passed) return;
    setDrawn([]);
    setScore(null);
  };

  const dashColor = hintVisible ? '#8a3b00' : '#a9a28c';
  return (
    <div className="mg-body">
      <svg
        ref={svgRef}
        className="trace-svg"
        viewBox={`0 0 ${TRACE_W} ${TRACE_H}`}
        data-testid="trace-canvas"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {strokes.map((s, i) => (
          <path
            key={i}
            d={toD(s)}
            fill="none"
            stroke={dashColor}
            strokeWidth={hintVisible ? 6 : 3}
            strokeDasharray={hintVisible ? '14 8' : '8 8'}
            strokeLinecap="round"
            data-testid="trace-guide"
          />
        ))}
        {drawn.map((s, i) => (
          <path key={i} d={toD(s)} fill="none" stroke="#3f6ae0" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
      <div className="trace-score" data-testid="trace-score">
        {score ? (
          <>
            <span>일치율 {pct(score.coverage)} (목표 {pct(spec.coverageMin)}↑)</span>
            <span>이탈 {pct(score.deviation)} (한도 {pct(spec.deviationMax)})</span>
          </>
        ) : (
          <span>점선을 따라 마우스를 누른 채 그려 보세요</span>
        )}
      </div>
      <div className="mg-msg">
        {score && <span className={score.passed ? 'ok' : 'bad'}>{score.passed ? '합격! 멋진 컵이에요' : '불합격… 점선을 더 따라가 볼까요?'}</span>}
      </div>
      <div className="mg-row">
        <button type="button" className="mg-btn ghost" onClick={clear}>지우기</button>
        <button type="button" className="mg-btn" onClick={submit}>제출</button>
      </div>
    </div>
  );
}
