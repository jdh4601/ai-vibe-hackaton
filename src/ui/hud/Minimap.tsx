import { useMemo } from 'react';
import {
  BUILDINGS, LAWNS, MAP_SIZE, MINIMAP_DIAMETER_PX, MINIMAP_WORLD_RADIUS, STAMINA_MAX, WALKWAYS,
} from '../../game/config';
import type { MinimapMarker, Vec3 } from '../../game/types';
import { radToDeg, staminaColor, worldToMinimap } from '../../logic/minimap';
import { useEventStore } from '../../stores/useEventStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useQuestStore } from '../../stores/useQuestStore';
import { buildMarkers } from './markers';

const R = MINIMAP_DIAMETER_PX / 2;
const RING = 7;
const SCALE = R / MINIMAP_WORLD_RADIUS; // px per meter
const VIEW = { radiusPx: R - RING, worldRadius: MINIMAP_WORLD_RADIUS * ((R - RING) / R) };

function Marker({ m, player, heading }: { m: MinimapMarker; player: Vec3; heading: number }) {
  const p = worldToMinimap(player, heading, m.position, VIEW, 9);
  const blink = m.kind === 'deadline' ? 'minimap-blink' : undefined;
  return (
    <g transform={`translate(${p.x} ${p.y})`} className={blink} opacity={p.clamped ? 0.85 : 1}>
      {m.kind === 'quest' || m.kind === 'deadline' ? (
        <>
          <circle r={8.5} fill={m.kind === 'deadline' ? '#e5484d' : '#ffb020'} stroke="#fff" strokeWidth={2} />
          <text className="minimap-marker-text" fill="#fff" fontWeight={900}>!</text>
        </>
      ) : (
        <>
          <circle r={9} fill="#fff" stroke={m.kind === 'ending' ? '#f2b705' : '#c9d2e3'} strokeWidth={1.5} />
          <text className="minimap-marker-text" fontSize={m.kind === 'ending' ? 14 : 11}>
            {m.kind === 'coffee' ? '☕' : m.kind === 'ending' ? '⭐' : (m.label ?? '❗')}
          </text>
        </>
      )}
    </g>
  );
}

export function Minimap() {
  const position = usePlayerStore((s) => s.position);
  const heading = usePlayerStore((s) => s.heading);
  const stamina = usePlayerStore((s) => s.stamina);
  const quests = useQuestStore((s) => s.quests);
  const endingUnlocked = useQuestStore((s) => s.endingUnlocked);
  const deadlineQuestId = useQuestStore((s) => s.deadlineQuestId);
  const activeEvent = useEventStore((s) => s.active);

  const markers = useMemo(
    () => buildMarkers({ quests, endingUnlocked, deadlineQuestId, activeEvent }),
    [quests, endingUnlocked, deadlineQuestId, activeEvent],
  );

  const ratio = Math.max(0, Math.min(1, stamina / STAMINA_MAX));
  const ringR = R - RING / 2;
  const circ = 2 * Math.PI * ringR;
  const north = worldToMinimap(position, heading, [position[0], 0, position[2] - 1000], VIEW, 11);
  const half = (MAP_SIZE / 2) * SCALE;

  return (
    <div className="minimap" data-testid="minimap" role="img" aria-label="미니맵">
      <svg width={MINIMAP_DIAMETER_PX} height={MINIMAP_DIAMETER_PX} viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`}>
        <defs>
          <clipPath id="mm-clip"><circle r={R - RING} /></clipPath>
        </defs>
        <circle r={R} fill="rgba(255,255,255,0.9)" />
        <g clipPath="url(#mm-clip)">
          <rect x={-R} y={-R} width={R * 2} height={R * 2} fill="#7fb4d6" />
          <g transform={`rotate(${radToDeg(heading)}) translate(${-position[0] * SCALE} ${-position[2] * SCALE})`}>
            <rect x={-half} y={-half} width={half * 2} height={half * 2} fill="#e9e2cf" />
            {LAWNS.map((l, i) => (
              <rect key={i} x={(l.x - l.w / 2) * SCALE} y={(l.z - l.d / 2) * SCALE} width={l.w * SCALE} height={l.d * SCALE} fill="#a8d5a2" rx={3} />
            ))}
            {WALKWAYS.map((w, i) => (
              <line key={i} x1={w.from[0] * SCALE} y1={w.from[1] * SCALE} x2={w.to[0] * SCALE} y2={w.to[1] * SCALE}
                stroke="#fbf7ea" strokeWidth={w.width * SCALE} strokeLinecap="butt" />
            ))}
            {BUILDINGS.map((b) => (
              <rect key={b.id} x={(b.x - b.w / 2) * SCALE} y={(b.z - b.d / 2) * SCALE} width={b.w * SCALE} height={b.d * SCALE}
                fill={b.color} stroke="rgba(0,0,0,0.25)" strokeWidth={0.8} rx={1.5} />
            ))}
          </g>
        </g>
        <circle r={ringR} fill="none" stroke="rgba(40,50,80,0.25)" strokeWidth={RING} />
        <circle
          r={ringR} fill="none" stroke={staminaColor(ratio)} strokeWidth={RING} strokeLinecap="round"
          strokeDasharray={`${circ * ratio} ${circ}`} transform="rotate(-90)" data-testid="stamina-ring"
        />
        {markers.map((m) => <Marker key={m.id} m={m} player={position} heading={heading} />)}
        {/* player arrow, always pointing up */}
        <polygon points="0,-9 7,8 0,4 -7,8" fill="#2f6bff" stroke="#fff" strokeWidth={2} strokeLinejoin="round" />
        <text className="minimap-n" x={north.x} y={north.y} textAnchor="middle" dominantBaseline="central">N</text>
      </svg>
    </div>
  );
}
