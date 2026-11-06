import { Html } from '@react-three/drei';
import { useEffect, useState, type CSSProperties } from 'react';
import { BARK_ROTATE_MS } from '../game/config';
import type { NpcDef } from '../game/types';
import { useDialogueStore } from '../stores/useDialogueStore';
import { useQuestStore } from '../stores/useQuestStore';

interface Props {
  npc: NpcDef;
  showHint: boolean; // within INTERACT_RADIUS: show the "E 대화" chip
  height?: number;
}

const bubble: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: 'max-content',
  maxWidth: 220,
  padding: '8px 12px',
  borderRadius: 16,
  background: 'rgba(255,255,255,0.94)',
  boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
  font: '600 14px/1.35 Pretendard, "Malgun Gothic", sans-serif',
  color: '#222',
  cursor: 'pointer',
  userSelect: 'none',
  pointerEvents: 'auto',
  border: 'none',
  textAlign: 'left',
};

const hint: CSSProperties = {
  marginTop: 4,
  padding: '2px 8px',
  borderRadius: 10,
  background: 'rgba(20,24,40,0.85)',
  color: '#fff',
  font: '700 12px Pretendard, "Malgun Gothic", sans-serif',
  textAlign: 'center',
};

function hashIndex(id: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % mod;
}

export function NpcBubble({ npc, showHint, height = 2.15 }: Props) {
  const [index, setIndex] = useState(() => hashIndex(npc.id, Math.max(1, npc.barks.length)));
  const status = useQuestStore((s) => (npc.questId ? s.quests[npc.questId].status : null));

  useEffect(() => {
    if (npc.barks.length < 2) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % npc.barks.length), BARK_ROTATE_MS);
    return () => window.clearInterval(t);
  }, [npc.barks.length]);

  const cleared = status === 'cleared';
  const marker = npc.questId ? (cleared ? '✓' : '!') : null;
  return (
    <Html position={[0, height, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
        <button
          type="button"
          data-testid={`npc-bubble-${npc.id}`}
          style={bubble}
          onClick={() => useDialogueStore.getState().start(npc.id)}
        >
          {marker && (
            <span
              style={{
                flex: 'none',
                width: 24,
                height: 24,
                borderRadius: 12,
                display: 'grid',
                placeItems: 'center',
                background: cleared ? '#2fbf71' : '#f2c14e',
                color: cleared ? '#fff' : '#3a2a00',
                font: '800 15px Pretendard, sans-serif',
              }}
            >
              {marker}
            </span>
          )}
          <span>{npc.barks[index % Math.max(1, npc.barks.length)] ?? npc.displayName}</span>
        </button>
        {showHint && <div style={hint}>E 대화</div>}
      </div>
    </Html>
  );
}
