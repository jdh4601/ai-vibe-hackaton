import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { DIAL_MAX_ANGLE, angleToVoltage, isLocked, voltageToAngle } from '../../logic/minigames/dial';
import type { DialSample } from '../../logic/minigames/dial';
import type { GameProps } from './gameProps';
import { SevenSegment } from './SevenSegment';
import './minigames.css';

const C = 120;
const clamp = (a: number) => Math.min(DIAL_MAX_ANGLE, Math.max(0, a));
const polar = (angle: number, r: number) => {
  const th = ((angle - 135) * Math.PI) / 180;
  return { x: C + r * Math.sin(th), y: C - r * Math.cos(th) };
};
const arc = (a0: number, a1: number, r: number) => {
  const p0 = polar(a0, r);
  const p1 = polar(a1, r);
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p1.x} ${p1.y}`;
};
const normalize = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;
const LOCK_PAUSE_MS = 900;

export function DialGame({ spec, hintVisible, onSuccess, onFail }: GameProps<'dial'>) {
  const [stageIdx, setStageIdx] = useState(0);
  const [angle, setAngle] = useState(0);
  const [locked, setLocked] = useState(false);
  const [missed, setMissed] = useState(false);
  const angleRef = useRef(0);
  const samples = useRef<DialSample[]>([]);
  const drag = useRef<{ last: number; moved: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const stage = spec.stages[stageIdx];

  const setBoth = (a: number) => {
    angleRef.current = a;
    setAngle(a);
  };

  // sample the voltage and watch for a LOCK
  useEffect(() => {
    if (!stage || locked) return;
    samples.current = [];
    const id = setInterval(() => {
      const now = performance.now();
      const list = samples.current;
      list.push({ t: now, v: angleToVoltage(angleRef.current) });
      while (list.length > 2 && now - list[0].t > spec.holdMs * 2) list.shift();
      if (isLocked(list, stage.targetV, stage.toleranceV, spec.holdMs)) setLocked(true);
    }, 50);
    return () => clearInterval(id);
  }, [stage, locked, spec.holdMs]);

  // after LOCK: next stage or finish
  useEffect(() => {
    if (!locked) return;
    const id = setTimeout(() => {
      if (stageIdx + 1 >= spec.stages.length) {
        onSuccess();
      } else {
        setStageIdx(stageIdx + 1);
        setBoth(0);
        setLocked(false);
        setMissed(false);
      }
    }, LOCK_PAUSE_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  if (!stage) return null;
  const volts = angleToVoltage(angle);
  const pointerTheta = (e: ReactPointerEvent) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return 0;
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    return (Math.atan2(dx, -dy) * 180) / Math.PI;
  };

  const onDown = (e: ReactPointerEvent) => {
    if (locked) return;
    svgRef.current?.setPointerCapture?.(e.pointerId);
    drag.current = { last: pointerTheta(e), moved: 0 };
    setMissed(false);
  };
  const onMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d || locked) return;
    const th = pointerTheta(e);
    const delta = normalize(th - d.last);
    d.last = th;
    d.moved += Math.abs(delta);
    setBoth(clamp(angleRef.current + delta));
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || locked) return;
    const off = Math.abs(angleToVoltage(angleRef.current) - stage.targetV) > stage.toleranceV;
    if (off && d.moved >= 20) {
      setMissed(true);
      onFail();
    }
  };
  const onKey = (e: ReactKeyboardEvent) => {
    if (locked) return;
    const step = e.shiftKey ? 5 : 1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setBoth(clamp(angleRef.current + step));
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setBoth(clamp(angleRef.current - step));
    else return;
    e.preventDefault();
  };

  const bandHalf = Math.max(voltageToAngle(stage.targetV + stage.toleranceV) - voltageToAngle(stage.targetV), 3);
  const bandMid = voltageToAngle(stage.targetV);
  const ticks = Array.from({ length: 11 }, (_, i) => (i * DIAL_MAX_ANGLE) / 10);

  return (
    <div className="mg-body">
      <div className="dial-stage" data-testid="dial-stage">
        {stageIdx + 1}단계 · {stage.label}
      </div>
      <div className="dial-dots">
        {spec.stages.map((_, i) => (
          <span key={i} className={`dial-dot${i < stageIdx || (i === stageIdx && locked) ? ' done' : i === stageIdx ? ' now' : ''}`} />
        ))}
      </div>
      <div className="dial-wrap">
        <svg
          ref={svgRef}
          className="dial-svg"
          viewBox="0 0 240 240"
          width={240}
          height={240}
          role="slider"
          tabIndex={0}
          aria-label="전압 다이얼"
          aria-valuemin={0}
          aria-valuemax={DIAL_MAX_ANGLE}
          aria-valuenow={Math.round(angle)}
          data-testid="dial-knob"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={onKey}
        >
          <path d={arc(0, DIAL_MAX_ANGLE, 106)} stroke="#d5dcf0" strokeWidth={8} fill="none" strokeLinecap="round" />
          {hintVisible && (
            <path
              data-testid="dial-band"
              d={arc(Math.max(0, bandMid - bandHalf), Math.min(DIAL_MAX_ANGLE, bandMid + bandHalf), 106)}
              stroke="#ffb300"
              strokeWidth={12}
              fill="none"
              strokeLinecap="round"
            />
          )}
          {ticks.map((a, i) => {
            const p0 = polar(a, 96);
            const p1 = polar(a, 112 + (i % 5 === 0 ? 4 : 0));
            return <line key={a} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="#8a97c4" strokeWidth={i % 5 === 0 ? 3 : 1.5} />;
          })}
          <g transform={`rotate(${angle - 135} ${C} ${C})`}>
            <circle cx={C} cy={C} r={84} fill="#3f4a73" />
            <circle cx={C} cy={C} r={78} fill="url(#knobGrad)" />
            <rect x={C - 5} y={C - 76} width={10} height={34} rx={5} fill="#ffd666" />
            <circle cx={C} cy={C} r={14} fill="#2c3558" />
          </g>
          <defs>
            <radialGradient id="knobGrad" cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#7d8ec9" />
              <stop offset="100%" stopColor="#3b4676" />
            </radialGradient>
          </defs>
        </svg>
        <div className="meter">
          <div className={`meter-screen${locked ? ' locked' : ''}`}>
            <SevenSegment text={volts.toFixed(2).padStart(5, '0')} />
            <span className="meter-unit">V</span>
          </div>
          <div className="meter-target">목표 {stage.targetV.toFixed(1)}V (±{stage.toleranceV}V)</div>
          <div className="meter-lock" data-testid="dial-lock">{locked ? 'LOCK' : missed ? '다시!' : ''}</div>
        </div>
      </div>
    </div>
  );
}
