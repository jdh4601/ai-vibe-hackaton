import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import {
  ENDING_GATHER_RADIUS,
  ENDING_POINT,
  ENDING_RADIUS,
} from '../game/config';
import type { GamePhase, QuestId, Vec3 } from '../game/types';
import { jacketForDepartment } from '../logic/jacket';
import { distance2D, yawToward } from '../logic/proximity';
import { useGameStore } from '../stores/useGameStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useQuestStore } from '../stores/useQuestStore';
import { getWorldNpcs } from './npcList';
import { npcStage } from './npcStage';
import { playerLive } from './playerLive';

const CUTSCENE_MS = 3000;
const SPREAD = (Math.PI * 0.9) / 2; // half-angle of the semicircle around the player's forward direction
const STEP_FORWARD_S = 1.5;
const STEP_DISTANCE = 2.0;
const JACKET_SWAP_S = 5.2;
const ORBIT_START_S = 6;
const ORBIT_END_S = 10;

const QUEST_ORDER: QuestId[] = ['q1-ee', 'q2-design', 'q3-math', 'q4-neat', 'q5-cse'];
const STAGE_PHASES: ReadonlySet<GamePhase> = new Set(['endingCutscene', 'endingSelect', 'jacketCeremony', 'credits']);

const easeInOut = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const clamp01 = (t: number): number => Math.max(0, Math.min(1, t));
const dirOf = (yaw: number): [number, number] => [-Math.sin(yaw), -Math.cos(yaw)];

interface Stage {
  center: Vec3; // where the player stands
  yaw: number; // the player's forward yaw; NPCs gather in front of it
  startedAt: number; // seconds, endingCutscene start
  ceremonyAt: number | null;
  swapped: boolean;
  stepFrom: Vec3 | null;
  camInit: boolean;
}

export function EndingStage() {
  const { camera } = useThree();
  const stage = useRef<Stage | null>(null);
  const prevPhase = useRef<GamePhase | null>(null);
  const camPos = useRef(new Vector3());
  const look = useRef(new Vector3());
  const wantPos = useRef(new Vector3());
  const wantLook = useRef(new Vector3());
  const goSelect = useRef(false);

  useEffect(
    () => () => {
      npcStage.poses.clear();
    },
    [],
  );

  const gather = (s: Stage) => {
    const quest = getWorldNpcs()
      .filter((n) => n.questId)
      .sort((a, b) => QUEST_ORDER.indexOf(a.questId!) - QUEST_ORDER.indexOf(b.questId!));
    quest.forEach((n, i) => {
      const a = quest.length === 1 ? 0 : -SPREAD + (2 * SPREAD * i) / (quest.length - 1);
      const [dx, dz] = dirOf(s.yaw + a);
      const x = s.center[0] + dx * ENDING_GATHER_RADIUS;
      const z = s.center[2] + dz * ENDING_GATHER_RADIUS;
      npcStage.poses.set(n.id, { x, z, rotationY: yawToward([x, 0, z], s.center) });
    });
  };

  const ensureStage = (nowS: number): Stage => {
    if (!stage.current) {
      const s: Stage = {
        center: [...playerLive.position],
        yaw: playerLive.heading,
        startedAt: nowS,
        ceremonyAt: null,
        swapped: false,
        stepFrom: null,
        camInit: false,
      };
      stage.current = s;
      gather(s);
    }
    return stage.current;
  };

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.1);
    const nowS = state.clock.elapsedTime;
    const g = useGameStore.getState();
    const phase = g.phase;

    // ---- trigger ----
    if (phase === 'explore') {
      if (stage.current) {
        stage.current = null;
        npcStage.poses.clear();
      }
      if (useQuestStore.getState().endingUnlocked && distance2D(playerLive.position, ENDING_POINT) <= ENDING_RADIUS) {
        g.setPhase('endingCutscene');
      }
      prevPhase.current = phase;
      return;
    }
    if (!STAGE_PHASES.has(phase)) {
      if (stage.current) {
        stage.current = null;
        npcStage.poses.clear();
      }
      prevPhase.current = phase;
      return;
    }
    if (phase === 'credits') return;

    const s = ensureStage(nowS);
    const entered = prevPhase.current !== phase;
    prevPhase.current = phase;
    if (entered && phase === 'jacketCeremony') s.ceremonyAt = nowS;
    if (entered && phase === 'endingCutscene') {
      s.startedAt = nowS;
      goSelect.current = false;
    }
    if (phase === 'jacketCeremony' && s.ceremonyAt === null) s.ceremonyAt = nowS;

    const tStage = nowS - s.startedAt;
    if (phase === 'endingCutscene' && tStage * 1000 >= CUTSCENE_MS && !goSelect.current) {
      goSelect.current = true;
      g.setPhase('endingSelect');
    }

    // ---- ceremony timeline ----
    let tC = 0;
    if (phase === 'jacketCeremony' && s.ceremonyAt !== null) {
      tC = nowS - s.ceremonyAt;
      const dept = g.chosenDepartmentId;
      const npc = dept ? getWorldNpcs().find((n) => n.departmentId === dept) : undefined;
      if (npc) {
        const existing = npcStage.poses.get(npc.id);
        if (!s.stepFrom) {
          const [dx, dz] = dirOf(s.yaw);
          s.stepFrom = existing
            ? [existing.x, 0, existing.z]
            : [s.center[0] + dx * ENDING_GATHER_RADIUS, 0, s.center[2] + dz * ENDING_GATHER_RADIUS];
        }
        const k = easeInOut(clamp01(tC / STEP_FORWARD_S));
        const [dx, dz] = dirOf(s.yaw);
        const tx = s.center[0] + dx * STEP_DISTANCE;
        const tz = s.center[2] + dz * STEP_DISTANCE;
        const x = s.stepFrom[0] + (tx - s.stepFrom[0]) * k;
        const z = s.stepFrom[2] + (tz - s.stepFrom[2]) * k;
        npcStage.poses.set(npc.id, { x, z, rotationY: yawToward([x, 0, z], s.center) });
      }
      if (!s.swapped && tC >= JACKET_SWAP_S) {
        s.swapped = true;
        if (dept) usePlayerStore.getState().setJacket(jacketForDepartment(dept));
      }
    }

    // ---- camera ----
    const [cx, cy, cz] = s.center;
    const [fx, fz] = dirOf(s.yaw);
    let behindYaw = s.yaw + Math.PI; // camera sits behind the player, looking toward the NPCs
    let dist = 6.5;
    let height = 2.4;
    let lookDist = 2.5;
    let lookHeight = 1.1;
    if (phase === 'jacketCeremony') {
      if (tC < ORBIT_START_S) {
        behindYaw += 0.6;
        dist = 5.2;
        height = 2.0;
        lookDist = 1.2;
      } else {
        const k = easeInOut(clamp01((tC - ORBIT_START_S) / (ORBIT_END_S - ORBIT_START_S)));
        behindYaw += 0.6 - 1.0 * k;
        dist = 5.2 - 2.2 * k;
        height = 2.0 - 0.6 * k;
        lookDist = 0.6;
        lookHeight = 1.0;
      }
    } else {
      behindYaw += Math.sin(tStage * 0.5) * 0.5;
    }
    const [bx, bz] = dirOf(behindYaw);
    wantPos.current.set(cx + bx * dist, cy + height, cz + bz * dist);
    wantLook.current.set(cx + fx * lookDist, cy + lookHeight, cz + fz * lookDist);
    if (!s.camInit) {
      s.camInit = true;
      camPos.current.copy(camera.position);
      look.current.set(cx, cy + lookHeight, cz);
    }
    const kc = 1 - Math.exp(-4 * dt);
    camPos.current.lerp(wantPos.current, kc);
    look.current.lerp(wantLook.current, kc);
    camera.position.copy(camPos.current);
    camera.lookAt(look.current);
  });

  return null;
}
