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
import { useEffect, useRef, useState } from 'react';
import type { OrderingToken } from '../../game/types';
import { isCorrectOrder, shuffleNotEqual } from '../../logic/minigames/ordering';
import type { GameProps, SpecOf } from './gameProps';
import './minigames.css';

type Round = SpecOf<'ordering'>['rounds'][number];

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

interface RoundProps {
  round: Round;
  mode: 'word' | 'code';
  seed: number;
  onSolved: () => void;
  onFail: () => void;
}

// One round; the parent keys it by round index so state starts fresh each round.
function OrderingRound({ round, mode, seed, onSolved, onFail }: RoundProps) {
  const [order, setOrder] = useState<string[]>(() => shuffleNotEqual(round.tokens, round.answer, seed).map((t) => t.id));
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [shake, setShake] = useState(0);
  const [solved, setSolved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const code = mode === 'code';
  const tokenById = new Map(round.tokens.map((t) => [t.id, t]));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrder((o) => arrayMove(o, o.indexOf(String(active.id)), o.indexOf(String(over.id))));
    setMessage(null);
  };

  const submit = () => {
    if (solved) return;
    if (isCorrectOrder(order, round.answer)) {
      setSolved(true);
      setMessage({ ok: true, text: '정답!' });
      timer.current = setTimeout(onSolved, code ? 1400 : 800);
    } else {
      setMessage({ ok: false, text: '순서가 맞지 않아요. 다시 해 볼까요?' });
      setShake((n) => n + 1);
      onFail();
    }
  };

  return (
    <>
      <div className="od-prompt" data-testid="od-prompt">{round.prompt}</div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={order} strategy={code ? verticalListSortingStrategy : horizontalListSortingStrategy}>
          <div key={shake} className={`od-list${code ? ' code' : ''}${shake ? ' mg-shake' : ''}`} data-testid="od-list">
            {order.map((id, i) => {
              const token = tokenById.get(id);
              return token ? <Chip key={id} token={token} mode={mode} index={i} /> : null;
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
      <div className="mg-msg">
        <span className={message ? (message.ok ? 'ok' : 'bad') : ''}>{message?.text ?? ''}</span>
      </div>
      <div className="mg-row">
        <button type="button" className="mg-btn" onClick={submit} disabled={solved}>제출</button>
      </div>
    </>
  );
}

export function OrderingGame({ spec, onSuccess, onFail }: GameProps<'ordering'>) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [seed] = useState(() => Math.floor(Math.random() * 1_000_000));
  const round = spec.rounds[roundIdx];
  if (!round) return null;
  return (
    <div className="mg-body">
      {spec.rounds.length > 1 && <div className="fb-round">문제 {roundIdx + 1} / {spec.rounds.length}</div>}
      <OrderingRound
        key={roundIdx}
        round={round}
        mode={spec.mode}
        seed={seed + roundIdx * 7919}
        onFail={onFail}
        onSolved={() => (roundIdx + 1 >= spec.rounds.length ? onSuccess() : setRoundIdx(roundIdx + 1))}
      />
    </div>
  );
}
