import { useEffect, useState } from 'react';
import { installAudioUnlock, tone, unlockAudio } from '../../audio/context';
import { playSfx } from '../../audio/sfx';
import { useGameStore } from '../../stores/useGameStore';
import '../hud/hud.css';
import { AdmissionLetter } from './AdmissionLetter';
import './overlays.css';
import { PhoneNotice } from './PhoneNotice';

type Stage = 'black' | 'phone' | 'letter' | 'mono' | 'flash';

const MONOLOGUE = ['…입학은 했는데.', '근데… 나는 뭘 좋아하지?', '일단, 나가 보자.'];
const BLACK_AUTO_MS = 3600;
const FLASH_MS = 900;

function alarm() {
  for (let i = 0; i < 4; i++) {
    tone({ freq: 1760, start: i * 0.25, dur: 0.1, type: 'square', gain: 0.04 });
    tone({ freq: 1760, start: i * 0.25 + 0.12, dur: 0.1, type: 'square', gain: 0.04 });
  }
}

function Monologue({ onDoor }: { onDoor: () => void }) {
  const [shown, setShown] = useState(1);
  const done = shown >= MONOLOGUE.length;
  return (
    <div className="ov mono ui-root" onClick={() => !done && setShown((n) => n + 1)} data-testid="monologue">
      <div className="mono-inner">
        {MONOLOGUE.slice(0, shown).map((l) => <div className="mono-line" key={l}>{l}</div>)}
        {done && (
          <button
            className="ui-btn mono-door"
            onClick={(e) => {
              e.stopPropagation();
              onDoor();
            }}
          >
            문을 연다
          </button>
        )}
        {!done && <div className="op-hint" style={{ position: 'static', marginTop: 40, color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>클릭해서 계속</div>}
      </div>
    </div>
  );
}

export function OpeningSequence() {
  const setPhase = useGameStore((s) => s.setPhase);
  const [stage, setStage] = useState<Stage>('black');

  useEffect(() => installAudioUnlock(), []);

  useEffect(() => {
    if (stage === 'black') {
      alarm();
      const t = setTimeout(() => setStage('phone'), BLACK_AUTO_MS);
      return () => clearTimeout(t);
    }
    if (stage === 'flash') {
      const t = setTimeout(() => setPhase('explore'), FLASH_MS);
      return () => clearTimeout(t);
    }
  }, [stage, setPhase]);

  const skip = () => setPhase('explore');
  const go = (next: Stage, sfx = true) => () => {
    unlockAudio();
    if (sfx) playSfx('select');
    setStage(next);
  };

  return (
    <>
      {stage === 'black' && (
        <div className="ov op-black ui-root" onClick={go('phone', false)} data-testid="opening-black">
          <div className="op-eye">…눈을 떴다.</div>
          <div className="op-hint">클릭해서 계속</div>
        </div>
      )}
      {stage === 'phone' && <PhoneNotice onOpen={go('letter')} />}
      {stage === 'letter' && <AdmissionLetter onNext={go('mono')} />}
      {(stage === 'mono' || stage === 'flash') && <Monologue onDoor={go('flash')} />}
      {stage === 'flash' && <div className="flash" />}
      {stage !== 'flash' && (
        <button className="ui-skip" onClick={skip}>건너뛰기</button>
      )}
    </>
  );
}
