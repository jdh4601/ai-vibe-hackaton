import { useEffect, useRef } from 'react';
import { playSfx } from '../../audio/sfx';
import { getSkill } from '../../data/skills';
import { useGameStore } from '../../stores/useGameStore';
import { useSkillStore } from '../../stores/useSkillStore';
import '../hud/hud.css';
import './overlays.css';

const AUTO_CLOSE_MS = 3000;

export function SkillAcquired() {
  const id = useSkillStore((s) => s.lastGrantedId);
  const setPhase = useGameStore((s) => s.setPhase);
  const closed = useRef(false);
  const skill = id ? getSkill(id) : undefined;

  const close = () => {
    if (closed.current) return;
    closed.current = true;
    setPhase('explore');
  };

  useEffect(() => {
    playSfx('fanfare');
    const t = setTimeout(close, AUTO_CLOSE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ov sa ui-root" onClick={close} data-testid="skill-acquired">
      <div className="sa-card">
        <div className="sa-emoji">{skill?.emoji ?? '✨'}</div>
        <div className="sa-title">{skill ? `${skill.name}을(를) 획득했습니다!` : '스킬을 획득했습니다!'}</div>
        {skill && <div className="sa-desc">{skill.description}</div>}
        <div className="sa-hint">클릭하면 닫힙니다</div>
      </div>
    </div>
  );
}
