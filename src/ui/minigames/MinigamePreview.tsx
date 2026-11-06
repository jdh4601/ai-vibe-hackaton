import { useState } from 'react';
import { DialGame } from './DialGame';
import { FillBlankGame } from './FillBlankGame';
import { KIND_DESCRIPTION, MinigameFrame } from './MinigameFrame';
import { OrderingGame } from './OrderingGame';
import { TraceGame } from './TraceGame';
import { PREVIEW_SPECS } from './previewSpecs';

// Owned by track D (Minigames).
// ?minigame=dial|trace|fillBlank|ordering-word|ordering-code renders one game standalone.
export function MinigamePreview({ kind }: { kind: string }) {
  const entry = PREVIEW_SPECS[kind];
  const [fails, setFails] = useState(0);
  const [done, setDone] = useState(false);
  const [run, setRun] = useState(0);
  if (!entry) return <div style={{ padding: 24 }}>Unknown minigame: {kind}</div>;

  const spec = entry.spec;
  const hintVisible = fails >= 2;
  const game = { hintVisible, onSuccess: () => setDone(true), onFail: () => setFails((n) => n + 1) };
  const restart = () => {
    setFails(0);
    setDone(false);
    setRun((n) => n + 1);
  };
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #cfe4ff, #f6e9ff)' }}>
      {done && <div className="mg-banner" data-testid="success-banner">성공!</div>}
      <MinigameFrame
        title={entry.title}
        description={KIND_DESCRIPTION[spec.kind]}
        failCount={fails}
        hint={entry.hint}
        hintVisible={hintVisible}
        onAbort={restart}
        abortLabel="다시 시작"
      >
        <div key={run}>
          {spec.kind === 'dial' && <DialGame spec={spec} {...game} />}
          {spec.kind === 'trace' && <TraceGame spec={spec} {...game} />}
          {spec.kind === 'fillBlank' && <FillBlankGame spec={spec} {...game} />}
          {spec.kind === 'ordering' && <OrderingGame spec={spec} {...game} />}
        </div>
      </MinigameFrame>
    </div>
  );
}
