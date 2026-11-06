import { useEffect, useMemo, useState } from 'react';
import { playBgm } from '../../audio/bgm';
import { playSfx } from '../../audio/sfx';
import { useGameStore } from '../../stores/useGameStore';
import '../hud/hud.css';
import './overlays.css';

// UI timeline (ms). The 3D camera and jacket swap (5.2s) are owned by track B.
export const CEREMONY_TIMELINE = { welcome: 2000, flash: 5000, confetti: 8000, final: 10000, credits: 13000 };

const COLORS = ['#ff5a7a', '#ffd34d', '#5ad1ff', '#7be0a0', '#b48cff', '#ff9a4d'];

function Confetti() {
  const pieces = useMemo(
    () => Array.from({ length: 70 }, (_, i) => ({
      left: `${(i * 37) % 100}%`,
      delay: `${((i * 53) % 30) / 10}s`,
      dur: `${2.6 + ((i * 17) % 20) / 10}s`,
      color: COLORS[i % COLORS.length],
      rot: (i * 29) % 360,
    })),
    [],
  );
  return (
    <>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti"
          style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur, background: p.color, transform: `rotate(${p.rot}deg)` }}
        />
      ))}
    </>
  );
}

export function JacketCeremony() {
  const setPhase = useGameStore((s) => s.setPhase);
  const [t, setT] = useState(0); // highest timeline stage reached, in ms

  useEffect(() => {
    playBgm('ending');
    const T = CEREMONY_TIMELINE;
    const timers = [
      setTimeout(() => setT(T.welcome), T.welcome),
      setTimeout(() => {
        setT(T.flash);
        playSfx('fanfare');
      }, T.flash),
      setTimeout(() => setT(T.confetti), T.confetti),
      setTimeout(() => setT(T.final), T.final),
      setTimeout(() => setPhase('credits'), T.credits),
    ];
    return () => timers.forEach(clearTimeout);
  }, [setPhase]);

  const T = CEREMONY_TIMELINE;
  return (
    <div className="ov jc ui-root" data-testid="jacket-ceremony">
      {t >= T.welcome && <div className="jc-welcome">우리 과에 온 걸 환영해!</div>}
      {t >= T.flash && t < T.confetti && <div className="flash fade" key="flash" />}
      {t >= T.confetti && <Confetti />}
      {t >= T.final && <div className="jc-final">나의 학과를 찾았다.</div>}
    </div>
  );
}
