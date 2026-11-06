import { useFrame } from '@react-three/fiber';
import { CapsuleCollider, RigidBody } from '@react-three/rapier';
import { memo, useMemo, useRef, useState } from 'react';
import type { Group } from 'three';
import { BUBBLE_RADIUS, INTERACT_RADIUS } from '../game/config';
import type { NpcDef } from '../game/types';
import { jacketForDepartment } from '../logic/jacket';
import { approachAngle, yawToward } from '../logic/proximity';
import { useGameStore } from '../stores/useGameStore';
import { Character, type HairStyle } from './Character';
import { NpcBubble } from './NpcBubble';
import { NpcProps } from './NpcProps';
import { npcStage } from './npcStage';
import { playerLive } from './playerLive';

const ANIMATE_RADIUS = 20; // NPCs farther than this skip their idle animation
const SKIN = ['#ffd9b8', '#f5c9a0', '#e8b48a', '#c98f65', '#ffe2cc'];
const HAIR = ['#2a1d17', '#4b3426', '#111111', '#7a4a2a', '#8b8b92', '#b5651d'];
const STYLES: HairStyle[] = ['short', 'long', 'bun', 'short'];

function hash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}

function NpcInner({ def }: { def: NpcDef }) {
  const group = useRef<Group>(null);
  const body = useRef<Group>(null);
  const animate = useRef(true);
  const facing = useRef(def.rotationY);
  const [near, setNear] = useState(false);
  const [hintOn, setHintOn] = useState(false);
  const [staged, setStaged] = useState(false);

  const look = useMemo(() => {
    const h = hash(def.id);
    return {
      skin: SKIN[h % SKIN.length]!,
      hair: HAIR[(h >> 4) % HAIR.length]!,
      style: STYLES[(h >> 8) % STYLES.length]!,
      glasses: (h >> 12) % 3 === 0,
      phase: (h % 1000) / 1000,
    };
  }, [def.id]);
  const jacket = useMemo(() => jacketForDepartment(def.departmentId), [def.departmentId]);
  const [px, py, pz] = def.position;

  useFrame((_, dtRaw) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(dtRaw, 0.1);
    const pose = npcStage.poses.get(def.id);
    if (!!pose !== staged) setStaged(!!pose);
    const phase = useGameStore.getState().phase;
    const [qx, , qz] = playerLive.position;
    const x = pose ? pose.x : px;
    const z = pose ? pose.z : pz;
    if (pose) g.position.set(x, py, z);
    else if (g.position.x !== px || g.position.z !== pz) g.position.set(px, py, pz);

    const dist = Math.hypot(qx - x, qz - z);
    animate.current = dist < ANIMATE_RADIUS;
    const explore = phase === 'explore' || phase === 'dialogue';
    const isNear = !pose && explore && dist <= BUBBLE_RADIUS;
    if (isNear !== near) setNear(isNear);
    const isHint = isNear && phase === 'explore' && dist <= INTERACT_RADIUS;
    if (isHint !== hintOn) setHintOn(isHint);

    if (!animate.current && !pose) return;
    const target = pose
      ? pose.rotationY
      : isNear
        ? yawToward([x, 0, z], [qx, 0, qz])
        : def.rotationY;
    facing.current = approachAngle(facing.current, target, 5 * dt);
    if (body.current) body.current.rotation.y = facing.current;
  });

  return (
    <>
      {!staged && (
        <RigidBody type="fixed" colliders={false} position={[px, py, pz]} rotation={[0, def.rotationY, 0]}>
          <CapsuleCollider args={[0.35, 0.3]} position={[0, 0.7, 0]} />
        </RigidBody>
      )}
      <group ref={group} position={[px, py, pz]}>
        <group ref={body} rotation={[0, def.rotationY, 0]}>
          <Character
            jacket={jacket}
            skinColor={look.skin}
            hairColor={look.hair}
            hairStyle={look.style}
            glasses={look.glasses}
            phase={look.phase}
            animateRef={animate}
          />
        </group>
        {!staged && (
          <group rotation={[0, def.rotationY, 0]}>
            <NpcProps keys={def.propKeys} />
          </group>
        )}
        {near && <NpcBubble npc={def} showHint={hintOn} />}
      </group>
    </>
  );
}

export const Npc = memo(NpcInner);
