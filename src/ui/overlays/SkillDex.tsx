import { useEffect } from 'react';
import { getDepartment } from '../../data/departments';
import { SKILLS } from '../../data/skills';
import type { SkillDef } from '../../game/types';
import { useGameStore } from '../../stores/useGameStore';
import { useSkillStore } from '../../stores/useSkillStore';
import '../hud/hud.css';
import './overlays.css';

const DEX_SIZE = 20;

type Cell = { kind: 'have' | 'hidden'; skill: SkillDef } | { kind: 'soon'; skill?: SkillDef };

export function buildDexCells(acquired: string[]): Cell[] {
  const cells: Cell[] = SKILLS.slice(0, DEX_SIZE).map((skill) => {
    if (acquired.includes(skill.id)) return { kind: 'have', skill };
    return skill.obtainable ? { kind: 'hidden', skill } : { kind: 'soon', skill };
  });
  while (cells.length < DEX_SIZE) cells.push({ kind: 'soon' });
  return cells;
}

export function SkillDex() {
  const dexOpen = useGameStore((s) => s.dexOpen);
  const phase = useGameStore((s) => s.phase);
  const setDexOpen = useGameStore((s) => s.setDexOpen);
  const acquired = useSkillStore((s) => s.acquired);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { phase: p, dexOpen: open } = useGameStore.getState();
      if (e.code === 'Tab') {
        e.preventDefault();
        if (open) setDexOpen(false);
        else if (p === 'explore') setDexOpen(true);
      } else if (e.code === 'Escape' && open) {
        setDexOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setDexOpen]);

  useEffect(() => {
    if (dexOpen && phase !== 'explore') setDexOpen(false);
  }, [dexOpen, phase, setDexOpen]);

  if (!dexOpen || phase !== 'explore') return null;
  const cells = buildDexCells(acquired);
  const have = cells.filter((c) => c.kind === 'have').length;

  return (
    <div className="ov dex ui-root" data-testid="skill-dex" onClick={() => setDexOpen(false)}>
      <div className="dex-panel ui-panel" onClick={(e) => e.stopPropagation()}>
        <div className="dex-head">
          <h2>스킬 도감</h2>
          <span>{have} / {cells.filter((c) => c.kind !== 'soon').length} 획득 · 총 {DEX_SIZE}칸</span>
        </div>
        <div className="dex-grid">
          {cells.map((c, i) => (
            <div key={c.skill?.id ?? `pad-${i}`} className={`dex-cell ${c.kind}`} data-kind={c.kind}>
              {c.kind === 'have' && (
                <>
                  <span className="d-emoji">{c.skill.emoji}</span>
                  <span className="d-name">{c.skill.name}</span>
                  <span className="d-dept">{getDepartment(c.skill.departmentId)?.name}</span>
                </>
              )}
              {c.kind === 'hidden' && (
                <>
                  <span className="d-emoji">{c.skill.emoji}</span>
                  <span className="d-name">???</span>
                </>
              )}
              {c.kind === 'soon' && (
                <>
                  <span className="d-emoji">🔒</span>
                  <span className="d-name">Coming Soon</span>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="dex-foot">Tab 또는 Esc로 닫기</div>
      </div>
    </div>
  );
}
