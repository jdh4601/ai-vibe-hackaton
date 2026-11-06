import { useState } from 'react';
import { playSfx } from '../../audio/sfx';
import { getDepartment } from '../../data/departments';
import { QUESTS } from '../../data/quests';
import { getSkill } from '../../data/skills';
import type { Department, DepartmentId, JacketSpec } from '../../game/types';
import { useGameStore } from '../../stores/useGameStore';
import { useSkillStore } from '../../stores/useSkillStore';
import '../hud/hud.css';
import './overlays.css';

function JacketPreview({ jacket }: { jacket: JacketSpec }) {
  return (
    <svg viewBox="0 0 76 64" aria-label="과잠 미리보기">
      <path d="M26 6 L50 6 L68 18 L62 34 L54 30 L54 58 L22 58 L22 30 L14 34 L8 18 Z" fill={jacket.bodyColor} stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
      <path d="M26 6 L8 18 L14 34 L22 30 L22 14 Z" fill={jacket.sleeveColor} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
      <path d="M50 6 L68 18 L62 34 L54 30 L54 14 Z" fill={jacket.sleeveColor} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
      <path d="M32 6 Q38 14 44 6" fill="none" stroke={jacket.sleeveColor} strokeWidth="3" />
    </svg>
  );
}

interface Option {
  dept: Department;
  skillName: string;
  skillEmoji: string;
  task: string;
}

export function EndingSelect() {
  const acquired = useSkillStore((s) => s.acquired);
  const [picked, setPicked] = useState<Option | null>(null);

  const options: Option[] = [];
  for (const id of acquired) {
    const skill = getSkill(id);
    const dept = skill ? getDepartment(skill.departmentId) : undefined;
    if (!skill || !dept) continue;
    const quest = QUESTS.find((q) => q.departmentId === dept.id);
    options.push({ dept, skillName: skill.name, skillEmoji: skill.emoji, task: quest?.title ?? skill.description });
  }

  const confirm = (id: DepartmentId) => {
    playSfx('success');
    const g = useGameStore.getState();
    g.chooseDepartment(id);
    g.setPhase('jacketCeremony');
  };

  return (
    <div className="ov es ui-root" data-testid="ending-select">
      <h2>어떤 시간이 제일 재밌었지?</h2>
      <p>직접 해 본 체험 중에서 하나를 골라 보자.</p>
      <div className="es-cards">
        {options.length === 0 && <div className="es-empty">아직 체험한 학과가 없어…</div>}
        {options.map((o, i) => (
          <button
            key={o.dept.id}
            className="es-card"
            style={{ animationDelay: `${i * 0.08}s` }}
            onClick={() => {
              playSfx('select');
              setPicked(o);
            }}
          >
            <div className="e-emoji">{o.dept.emoji}</div>
            <div className="e-dept">{o.dept.name}</div>
            <div className="e-skill">{o.skillEmoji} {o.skillName}</div>
            <div className="e-task">“{o.task}”</div>
            <JacketPreview jacket={o.dept.jacket} />
          </button>
        ))}
      </div>
      {picked && (
        <div className="confirm-back" role="dialog" aria-label="학과 확인">
          <div className="confirm ui-panel">
            <div className="c-jacket"><JacketPreview jacket={picked.dept.jacket} /></div>
            <h3>{picked.dept.name}로 정할래?</h3>
            <div className="c-btns">
              <button className="ui-btn" onClick={() => confirm(picked.dept.id)}>결정!</button>
              <button className="ui-btn ghost" onClick={() => setPicked(null)}>다시 생각해볼래</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
