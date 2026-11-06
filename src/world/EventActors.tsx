import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState, type ReactNode } from 'react';
import type { Group } from 'three';
import { MAP_HALF, PROFESSOR_CATCH_RADIUS, PROFESSOR_SPEED } from '../game/config';
import type { ActiveEvent, JacketSpec, MoveMode, Vec3 } from '../game/types';
import { distance2D, yawToward } from '../logic/proximity';
import { useEventStore } from '../stores/useEventStore';
import { useGameStore } from '../stores/useGameStore';
import { Character } from './Character';
import { playerLive } from './playerLive';

const PROFESSOR_JACKET: JacketSpec = { bodyColor: '#6b5a48', sleeveColor: '#efe6d8', departmentLine: null };
const CLASSMATE_JACKET: JacketSpec = { bodyColor: '#3f6fb5', sleeveColor: '#ffffff', departmentLine: null };
const CLASSMATE_SPEED = 4;
const CLASSMATE_STOP_DIST = 1.6;
const SNACK_REACH_RADIUS = 3;

// The event stores may use either clock; startedAt in epoch ms means Date.now().
const clockFor = (a: ActiveEvent): (() => number) => (a.startedAt > 1e12 ? Date.now : () => performance.now());

const clampMap = (v: number): number => Math.max(-MAP_HALF + 2, Math.min(MAP_HALF - 2, v));

function fallbackNear(distance: number, angle: number): Vec3 {
  const [px, , pz] = playerLive.position;
  return [clampMap(px + Math.sin(angle) * distance), 0, clampMap(pz + Math.cos(angle) * distance)];
}

function Chip({ children, y = 2.1 }: { children: ReactNode; y?: number }) {
  return (
    <Html position={[0, y, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div
        style={{
          padding: '4px 10px',
          borderRadius: 14,
          background: 'rgba(255,255,255,0.94)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          font: '700 14px Pretendard, "Malgun Gothic", sans-serif',
          whiteSpace: 'nowrap',
          color: '#222',
        }}
      >
        {children}
      </div>
    </Html>
  );
}

// Shared walker: moves a group toward the live player position on the ground plane.
function useChaser(
  event: ActiveEvent,
  start: Vec3,
  speed: number,
  stopDist: number,
  onTick: (dist: number, now: number) => void,
) {
  const group = useRef<Group>(null);
  const pos = useRef<Vec3>(start);
  const moving = useRef(true);
  const clock = useRef(clockFor(event));
  useFrame((_, dtRaw) => {
    if (useGameStore.getState().phase !== 'explore') return;
    const dt = Math.min(dtRaw, 0.1);
    const target = playerLive.position;
    const dist = distance2D(pos.current, target);
    moving.current = dist > stopDist;
    if (moving.current) {
      const step = Math.min(speed * dt, dist - stopDist);
      const nx = pos.current[0] + ((target[0] - pos.current[0]) / dist) * step;
      const nz = pos.current[2] + ((target[2] - pos.current[2]) / dist) * step;
      pos.current = [nx, 0, nz];
    }
    const g = group.current;
    if (g) {
      g.position.set(pos.current[0], 0, pos.current[2]);
      g.rotation.y = yawToward(pos.current, target);
    }
    onTick(distance2D(pos.current, target), clock.current());
  });
  return { group, moving };
}

function Professor({ event }: { event: ActiveEvent }) {
  const start = useRef<Vec3>(event.position ?? fallbackNear(14, Math.random() * Math.PI * 2));
  const done = useRef(false);
  const { group } = useChaser(event, start.current, PROFESSOR_SPEED, 0.2, (dist, now) => {
    if (done.current) return;
    if (dist <= PROFESSOR_CATCH_RADIUS) {
      done.current = true;
      useEventStore.getState().resolve('caught');
    } else if (now >= event.endsAt) {
      done.current = true;
      useEventStore.getState().resolve('escaped');
    }
  });
  return (
    <group ref={group} position={start.current}>
      <Character jacket={PROFESSOR_JACKET} moveMode="run" hairColor="#9a9aa2" glasses hairStyle="short" skinColor="#f1cfae" />
      <Chip>🎓 거기 서라!</Chip>
    </group>
  );
}

function Classmate({ event }: { event: ActiveEvent }) {
  const start = useRef<Vec3>(event.position ?? fallbackNear(12, Math.random() * Math.PI * 2));
  const done = useRef(false);
  const [mode, setMode] = useState<MoveMode>('walk');
  const { group, moving } = useChaser(event, start.current, CLASSMATE_SPEED, CLASSMATE_STOP_DIST, (_d, now) => {
    setMode(moving.current ? 'walk' : 'idle');
    if (!done.current && now >= event.endsAt) {
      done.current = true;
      useEventStore.getState().resolve('expired');
    }
  });
  return (
    <group ref={group} position={start.current}>
      <Character jacket={CLASSMATE_JACKET} moveMode={mode} hairColor="#5a3b2a" hairStyle="bun" />
      <Chip>📢 야 너 그거 과제 했어? 오늘까지래!</Chip>
    </group>
  );
}

function SnackBooth({ event }: { event: ActiveEvent }) {
  const pos = useRef<Vec3>(event.position ?? [10, 0, 30]);
  const done = useRef(false);
  const clock = useRef(clockFor(event));
  useFrame(() => {
    if (done.current || useGameStore.getState().phase !== 'explore') return;
    if (distance2D(playerLive.position, pos.current) <= SNACK_REACH_RADIUS) {
      done.current = true;
      useEventStore.getState().resolve('reached');
    } else if (clock.current() >= event.endsAt) {
      done.current = true;
      useEventStore.getState().resolve('expired');
    }
  });
  return (
    <group position={pos.current}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2.2, 1.0, 1.0]} />
        <meshStandardMaterial color="#f7d6e0" />
      </mesh>
      {([-1.0, 1.0] as const).map((x) => (
        <mesh key={x} position={[x, 1.2, -0.4]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 2.4, 8]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>
      ))}
      <mesh position={[0, 2.45, -0.1]} rotation={[0.18, 0, 0]} castShadow>
        <boxGeometry args={[2.6, 0.08, 1.6]} />
        <meshStandardMaterial color="#ff8fa3" />
      </mesh>
      {([-0.7, -0.2, 0.3, 0.8] as const).map((x, i) => (
        <mesh key={x} position={[x, 1.08, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.08, 14]} />
          <meshStandardMaterial color={['#c98a4b', '#e8b36a', '#9c5f33', '#f2c88a'][i]} />
        </mesh>
      ))}
      {/* beacon so the booth is findable from afar */}
      <mesh position={[0, 12, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 24, 12, 1, true]} />
        <meshBasicMaterial color="#ffd166" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <Chip y={3.2}>🍪 간식 나눔!</Chip>
    </group>
  );
}

export function EventActors() {
  const active = useEventStore((s) => s.active);
  if (!active) return null;
  const key = `${active.id}-${active.startedAt}`;
  switch (active.id) {
    case 'professorKidnap':
      return <Professor key={key} event={active} />;
    case 'assignmentAlert':
      return <Classmate key={key} event={active} />;
    case 'snackEvent':
      return <SnackBooth key={key} event={active} />;
  }
}
