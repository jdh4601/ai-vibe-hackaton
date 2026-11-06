import { useEffect } from 'react';
import { beep } from '../../audio/beep';
import { playSfx } from '../../audio/sfx';
import type { DialogueChoiceId, DialogueLine, DialogueScript } from '../../game/types';
import { useDialogueStore } from '../../stores/useDialogueStore';
import '../hud/hud.css';
import { ChoiceButtons } from './ChoiceButtons';
import './dialogue.css';
import { useTypewriter } from './useTypewriter';

interface LineViewProps {
  script: DialogueScript;
  line: DialogueLine;
  isLast: boolean;
  onNext: () => void;
  onChoose: (id: DialogueChoiceId) => void;
}

function LineView({ script, line, isLast, onNext, onChoose }: LineViewProps) {
  const { shown, done, complete } = useTypewriter(line.text, () => beep(script.voicePitch));
  const showChoices = isLast && done && !!script.choices?.length;

  const act = () => {
    if (!done) complete();
    else if (!showChoices) onNext();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      e.preventDefault();
      if (e.repeat) return;
      act();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="dlg-wrap ui-root" onClick={act} data-testid="dialogue-box">
      <div className="dlg-name">{line.speaker}</div>
      <div className="dlg-box ui-panel">
        <p className="dlg-text">{shown}<span className="dlg-ghost">{line.text.slice(shown.length)}</span></p>
        {showChoices && script.choices && (
          <ChoiceButtons
            choices={script.choices}
            onChoose={(id) => {
              playSfx('select');
              onChoose(id);
            }}
          />
        )}
        {done && !showChoices && <span className="dlg-next" aria-hidden="true">▼</span>}
      </div>
    </div>
  );
}

export function DialogueBox() {
  const script = useDialogueStore((s) => s.script);
  const index = useDialogueStore((s) => s.index);
  const advance = useDialogueStore((s) => s.advance);
  const choose = useDialogueStore((s) => s.choose);
  if (!script) return null;
  const line = script.lines[index];
  if (!line) return null;
  return (
    <LineView
      key={`${index}:${line.text}`}
      script={script}
      line={line}
      isLast={index >= script.lines.length - 1}
      onNext={advance}
      onChoose={choose}
    />
  );
}
