import { useEffect } from 'react';
import { stopBgm } from '../../audio/bgm';
import { DEPARTMENTS } from '../../data/departments';
import '../hud/hud.css';
import './overlays.css';

export function Credits() {
  useEffect(() => () => stopBgm('ending'), []);
  return (
    <div className="ov cr ui-root" data-testid="credits">
      <div className="cr-scroll">
        <h1>새내기 오디세이</h1>
        <div className="cr-sub">나의 학과를 찾아서</div>
        <div className="cr-depts">
          {DEPARTMENTS.map((d) => (
            <div className="cr-dept" key={d.id}>
              <span className="c-emoji">{d.emoji}</span>
              {d.name}
            </div>
          ))}
        </div>
        <h2>Team</h2>
        <p>기획 · 개발 · 디자인 — 새내기 오디세이 팀</p>
        <h2>Special Thanks</h2>
        <p>학과 체험을 도와준 모든 선배님들</p>
        <h2>&nbsp;</h2>
        <p>Made with Claude Code</p>
        <p>플레이해 주셔서 감사합니다!</p>
      </div>
      <button className="ui-btn cr-restart" onClick={() => window.location.reload()}>처음부터</button>
    </div>
  );
}
