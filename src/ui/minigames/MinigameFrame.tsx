import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { MinigameKind } from '../../game/types';
import './minigames.css';

export const KIND_DESCRIPTION: Record<MinigameKind, string> = {
  dial: '다이얼을 돌려 멀티미터 값을 목표 전압에 맞추세요. 범위 안에서 1초 유지하면 LOCK!',
  trace: '마우스를 누른 채 점선을 따라 컵 평면도를 그리고 제출하세요.',
  fillBlank: '규칙을 찾아 빈칸에 알맞은 숫자 타일을 끌어다 놓으세요.',
  ordering: '블록을 끌어서 올바른 순서로 맞춘 뒤 제출하세요.',
};

interface FrameProps {
  title: string;
  description: string;
  failCount: number;
  hint?: string;
  hintVisible: boolean;
  onAbort: () => void;
  abortLabel?: string;
  children?: ReactNode;
}

export function MinigameFrame({ title, description, failCount, hint, hintVisible, onAbort, abortLabel = '포기', children }: FrameProps) {
  useEffect(() => {
    document.exitPointerLock?.();
  }, []);
  return (
    <div className="mg-backdrop" role="dialog" aria-modal="true" aria-label={title} data-testid="minigame-modal">
      <div className="mg-panel">
        <div className="mg-head">
          <div>
            <h2 className="mg-title">{title}</h2>
            <p className="mg-desc">{description}</p>
          </div>
          <div className="mg-spacer" />
          <button type="button" className="mg-abort" onClick={onAbort}>{abortLabel}</button>
        </div>
        <div className="mg-meta">
          <span className="mg-fails" data-testid="fail-count">실패 {failCount}회</span>
          {hintVisible && hint && <span className="mg-hint" data-testid="hint">힌트: {hint}</span>}
        </div>
        {children}
      </div>
    </div>
  );
}
