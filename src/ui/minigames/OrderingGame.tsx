import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { OrderingToken } from '../../game/types';
import { isCorrectOrder, shuffleNotEqual } from '../../logic/minigames/ordering';
import type { GameProps } from './gameProps';
import './minigames.css';

function Chip({ token, mode, index }: { token: OrderingToken; mode: 'word' | 'code'; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: token.id });
  return (
    <div
      ref={setNodeRef}
      className={`od-chip${mode === 'code' ? ' code' : ''}${isDragging ? ' drag' : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-testid="chip"
      data-id={token.id}
      {...attributes}
      {...listeners}
    >
      {mode === 'code' && <span className="ln">{index + 1}</span>}
      <span>{token.label}</span>
      {token.sub && <small>{token.sub}</small>}
    </div>
  );
}

export function OrderingGame({ spec, onSuccess, onFail }: GameProps<'ordering'>) {
  const [round, setRound] = useState(0);
  const [seed] = useState(() => Math.floor(Math.random() * 1_000_000));
  const [order, setOrder] = useState<string[]>(() => (spec.rounds[0] ? shuffleNotEqual(spec.rounds[0].tokens, spec.rounds[0].answer, seed).map((t) => t.id) : []));
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [shake, setShake] = useState(0);
  const [solved, setSolved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const current = spec.rounds[round];
  const tokenById = useMemo(() => new Map((current?.tokens ?? []).map((t) => [t.id, t])), [current]);

  useEffect(() => {
    if (!current) return;
    setOrder(shuffleNotEqual(current.tokens, current.answer, seed + round * 7919).map((t) => t.id));
    setMessage(null);
    setSolved(false);
  }, [current, seed, round]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  if (!current) return null;
  const code = spec.mode === 'code';

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrder((o) => arrayMove(o, o.indexOf(String(active.id)), o.indexOf(String(over.id))));
    setMessage(null);
  };

  const submit = () => {
    if (solved) return;
    if (isCorrectOrder(order, current.answer)) {
      setSolved(true);
      setMessage({ ok: true, text: '정답!' });
      timer.current = setTimeout(() => {
        if (round + 1 >= spec.rounds.length) onSuccess();
        else setRound(round + 1);
      }, code ? 1400 : 800);
    } else {
      setMessage({ ok: false, text: '순서가 맞지 않아요. 다시 해 볼까요?' });
      setShake((n) => n + 1);
      onFail();
    }
  };

  return (
    <div className="mg-body">
      {spec.rounds.length > 1 && <div className="fb-round">문제 {round + 1} / {spec.rounds.length}</div>}
      <div className="od-prompt" data-testid="od-prompt">{current.prompt}</div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={order} strategy={code ? verticalListSortingStrategy : horizontalListSortingStrategy}>
          <div key={shake} className={`od-list${code ? ' code' : ''}${shake ? ' mg-shake' : ''}`} data-testid="od-list">
            {order.map((id, i) => {
              const token = tokenById.get(id);
              return token ? <Chip key={id} token={token} mode={spec.mode} index={i} /> : null;
            })}
          </div>
        </SortableContext>
      </DndContext>
      {code && solved && (
        <div className="od-term" data-testid="od-terminal">
          <div>$ curl https://festival.inu.ac.kr/api</div>
          <div><b>200 OK</b></div>
        </div>
      )}
      <div className="mg-msg" role="status">
        <span className={message ? (message.ok ? 'ok' : 'bad') : ''}>{message?.text ?? ''}</span>
      </div>
      <div className="mg-row">
        <button type="button" className="mg-btn" onClick={submit} disabled={solved}>제출</button>
      </div>
    </div>
  );
}
