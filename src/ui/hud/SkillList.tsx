import { useEffect } from 'react';
import { getSkill } from '../../data/skills';
import { useSkillStore } from '../../stores/useSkillStore';

const FLASH_MS = 1000;

export function SkillList() {
  const acquired = useSkillStore((s) => s.acquired);
  const highlightId = useSkillStore((s) => s.highlightId);
  const clearHighlight = useSkillStore((s) => s.clearHighlight);

  useEffect(() => {
    if (!highlightId) return;
    const t = setTimeout(clearHighlight, FLASH_MS);
    return () => clearTimeout(t);
  }, [highlightId, clearHighlight]);

  return (
    <div className="skill-list ui-panel" data-testid="skill-list">
      <h3>획득한 스킬</h3>
      {acquired.length === 0 && <div className="skill-empty">아직 없음 — 선배를 찾아가 보자</div>}
      {acquired.map((id) => {
        const skill = getSkill(id);
        if (!skill) return null;
        return (
          <div key={id} className={`skill-item${id === highlightId ? ' flash' : ''}`} data-testid={`skill-${id}`}>
            <span className="emoji">{skill.emoji}</span>
            <span>{skill.name}</span>
          </div>
        );
      })}
    </div>
  );
}
