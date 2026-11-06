import { DndContext, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useRef, useState } from 'react';
import { isCleared, isCorrectTile } from '../../logic/minigames/fillBlank';
import type { GameProps } from './gameProps';
import './minigames.css';

function Tile({ value, onPick }: { value: number; onPick: (v: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `tile-${value}`, data: { value } });
  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`fb-tile${isDragging ? ' drag' : ''}`}
      style={{ transform: CSS.Translate.toString(transform) }}
      onClick={() => onPick(value)}
      data-testid={`tile-${value}`}
      {...listeners}
      {...attributes}
    >
      {value}
    </button>
  );
}

function Blank({ filled }: { filled: number | null }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'blank' });
  return (
    <div
      ref={setNodeRef}
      data-testid="blank"
      className={`fb-cell fb-blank${isOver ? ' over' : ''}${filled !== null ? ' filled' : ''}`}
    >
      {filled !== null ? filled : '?'}
    </div>
  );
}

export function FillBlankGame({ spec, onSuccess, onFail }: GameProps<'fillBlank'>) {
  const [round, setRound] = useState(0);
  const [filled, setFilled] = useState<number | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [shake, setShake] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const current = spec.rounds[round];
  if (!current) return null;

  const submit = (value: number) => {
    if (filled !== null) return; // waiting for the next round
    if (isCorrectTile(current, value)) {
      setFilled(value);
      setMessage({ ok: true, text: '정답!' });
      timer.current = setTimeout(() => {
        const done = round + 1;
        if (isCleared(done, spec.rounds.length)) {
          onSuccess();
          return;
        }
        setRound(done);
        setFilled(null);
        setMessage(null);
      }, 700);
    } else {
      setMessage({ ok: false, text: '다시 생각해 볼까?' });
      setShake((n) => n + 1);
      onFail();
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    if (e.over?.id !== 'blank') return;
    const value = e.active.data.current?.value;
    if (typeof value === 'number') submit(value);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="mg-body">
        <div className="fb-round" data-testid="fb-round">라운드 {round + 1} / {spec.rounds.length}</div>
        <div key={shake} className={`fb-seq${shake ? ' mg-shake' : ''}`}>
          {current.sequence.map((n, i) =>
            n === null ? <Blank key={i} filled={filled} /> : <div key={i} className="fb-cell">{n}</div>,
          )}
        </div>
        <div className="mg-msg" role="status" data-ok={message?.ok ? '1' : '0'}>
          <span className={message ? (message.ok ? 'ok' : 'bad') : ''}>{message?.text ?? '타일을 빈칸으로 끌어다 놓아 봐요'}</span>
        </div>
        <div className="mg-row">
          {current.options.map((o) => (
            <Tile key={`${round}-${o}`} value={o} onPick={submit} />
          ))}
        </div>
      </div>
    </DndContext>
  );
}
