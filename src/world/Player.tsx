import { useKeyboardControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import { Ecctrl, type EcctrlHandle } from 'ecctrl';
import { useEffect, useRef } from 'react';
import { Vector3, type Group } from 'three';
import { getNpc } from '../data/npcs';
import {
  CAMERA_DISTANCE,
  CAMERA_HEIGHT,
  PLAYER_POSE_HZ,
  RUN_SPEED,
  SPAWN_POINT,
  WALK_SPEED,
} from '../game/config';
import type { GamePhase, MoveMode } from '../game/types';
import { angleDelta, approachAngle, yawToward } from '../logic/proximity';
import { useDialogueStore } from '../stores/useDialogueStore';
import { useGameStore } from '../stores/useGameStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { Character } from './Character';
import { cameraRig, playerLive } from './playerLive';

// Distance from the physics body center down to the soles (capsule half height + radius + float height).
const CAPSULE_HALF_HEIGHT = 0.5;
const CAPSULE_RADIUS = 0.3;
const FLOAT_HEIGHT = 0.2; // ecctrl default
const FOOT_OFFSET = CAPSULE_HALF_HEIGHT + CAPSULE_RADIUS + FLOAT_HEIGHT;
const PIVOT_HEIGHT = CAMERA_HEIGHT * 0.9; // camera look-at height above the feet
const SHOULDER_OFFSET = 0.45; // camera sits over the right shoulder
const MIN_PITCH = -0.25;
const MAX_PITCH = 1.1;
const MOUSE_SENS = 0.0025;
const TURN_RATE = 14; // rad/s the model turns toward its move direction

// Phases in which EndingStage owns the camera.
const ENDING_CAMERA_PHASES: ReadonlySet<GamePhase> = new Set([
  'endingCutscene',
  'endingSelect',
  'jacketCeremony',
  'credits',
]);

export function Player() {
  const ecctrl = useRef<EcctrlHandle>(null);
  const visual = useRef<Group>(null);
  const [, getKeys] = useKeyboardControls();
  const jacket = usePlayerStore((s) => s.jacket);
  const moveMode = usePlayerStore((s) => s.moveMode);
  const { gl, camera } = useThree();
  const { world, rapier } = useRapier();

  const live = useRef({
    heading: 0,
    camPos: new Vector3(),
    lookAt: new Vector3(),
    snap: true,
    poseClock: 0,
    drag: { down: false, moved: 0 },
  });
  const tmp = useRef({ dir: new Vector3(), pivot: new Vector3(), want: new Vector3(), target: new Vector3() });

  // Mouse look: pointer lock after a click on the canvas, with drag-to-rotate as a fallback.
  useEffect(() => {
    const canvas = gl.domElement;
    const isExplore = () => useGameStore.getState().phase === 'explore';
    const rotate = (dx: number, dy: number) => {
      cameraRig.yaw -= dx * MOUSE_SENS;
      cameraRig.pitch = Math.min(MAX_PITCH, Math.max(MIN_PITCH, cameraRig.pitch + dy * MOUSE_SENS));
    };
    const onMove = (e: MouseEvent) => {
      if (!isExplore()) return;
      if (document.pointerLockElement === canvas) rotate(e.movementX, e.movementY);
      else if (live.current.drag.down) {
        live.current.drag.moved += Math.abs(e.movementX) + Math.abs(e.movementY);
        rotate(e.movementX, e.movementY);
      }
    };
    const onDown = () => {
      live.current.drag = { down: true, moved: 0 };
    };
    const onUp = () => {
      const { moved, down } = live.current.drag;
      live.current.drag.down = false;
      if (down && moved < 4 && isExplore() && document.pointerLockElement !== canvas) {
        void Promise.resolve(canvas.requestPointerLock()).catch(() => undefined);
      }
    };
    document.addEventListener('mousemove', onMove);
    canvas.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    const unsub = useGameStore.subscribe((s, prev) => {
      if (s.phase !== prev.phase && s.phase !== 'explore' && document.pointerLockElement) document.exitPointerLock();
    });
    return () => {
      document.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      unsub();
      if (document.pointerLockElement === canvas) document.exitPointerLock();
    };
  }, [gl]);

  useFrame((_, dtRaw) => {
    const c = ecctrl.current;
    if (!c) return;
    const dt = Math.min(dtRaw, 0.1);
    const now = performance.now();
    const player = usePlayerStore.getState();
    const phase = useGameStore.getState().phase;
    const explore = phase === 'explore';
    const L = live.current;

    const tp = player.teleportTarget;
    if (tp) {
      c.body.setTranslation({ x: tp[0], y: tp[1] + FOOT_OFFSET, z: tp[2] }, true);
      c.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      player.clearTeleport();
      L.snap = true;
    }

    // ---- input -> ecctrl ----
    const k = getKeys();
    const moving = explore && (k.forward || k.backward || k.leftward || k.rightward);
    const run = moving && k.run && player.canRun(now);
    c.setMovement({
      forward: explore && k.forward,
      backward: explore && k.backward,
      leftward: explore && k.leftward,
      rightward: explore && k.rightward,
      run,
    });
    const mode: MoveMode = moving ? (run ? 'run' : 'walk') : 'idle';
    if (mode !== player.moveMode) player.setMoveMode(mode);
    player.tickStamina(dt, now);

    // ---- pose ----
    const pos = c.currPos;
    const feetY = pos.y - FOOT_OFFSET;
    const vel = c.currLinVel;
    let target = L.heading;
    let turn = TURN_RATE;
    const npcId = useDialogueStore.getState().script?.npcId;
    const talkNpc = phase === 'dialogue' && npcId ? getNpc(npcId) : undefined;
    if (talkNpc) {
      target = yawToward([pos.x, 0, pos.z], talkNpc.position);
      turn = 6;
    } else if (explore && Math.hypot(vel.x, vel.z) > 0.4) {
      target = Math.atan2(-vel.x, -vel.z);
    }
    L.heading = approachAngle(L.heading, target, turn * dt);
    if (visual.current) {
      visual.current.position.set(pos.x, feetY, pos.z);
      visual.current.rotation.y = L.heading;
    }
    playerLive.position = [pos.x, feetY, pos.z];
    playerLive.heading = L.heading;
    L.poseClock += dt;
    if (L.poseClock >= 1 / PLAYER_POSE_HZ) {
      L.poseClock = 0;
      player.setPose([pos.x, feetY, pos.z], L.heading);
    }

    // ---- camera ----
    if (ENDING_CAMERA_PHASES.has(phase)) {
      L.snap = true;
      return;
    }
    const T = tmp.current;
    let lookMix = 0;
    if (talkNpc) {
      const want = yawToward([pos.x, 0, pos.z], talkNpc.position);
      const ease = 1 - Math.exp(-4 * dt);
      cameraRig.yaw += angleDelta(cameraRig.yaw, want) * ease;
      cameraRig.pitch += (0.12 - cameraRig.pitch) * ease;
      lookMix = 0.4;
    }
    const cp = Math.cos(cameraRig.pitch);
    T.dir.set(Math.sin(cameraRig.yaw) * cp, Math.sin(cameraRig.pitch), Math.cos(cameraRig.yaw) * cp);
    T.pivot.set(
      pos.x + Math.cos(cameraRig.yaw) * SHOULDER_OFFSET,
      feetY + PIVOT_HEIGHT,
      pos.z - Math.sin(cameraRig.yaw) * SHOULDER_OFFSET,
    );
    let dist = CAMERA_DISTANCE;
    const hit = world.castRay(
      new rapier.Ray(T.pivot, T.dir),
      CAMERA_DISTANCE + 0.3,
      true,
      undefined,
      undefined,
      undefined,
      c.body,
    );
    if (hit) dist = Math.max(1.0, Math.min(CAMERA_DISTANCE, hit.timeOfImpact - 0.3));
    T.want.copy(T.pivot).addScaledVector(T.dir, dist);
    T.target.copy(T.pivot);
    if (talkNpc) {
      const [nx, , nz] = talkNpc.position;
      T.target.x += (nx - T.pivot.x) * lookMix;
      T.target.z += (nz - T.pivot.z) * lookMix;
    }
    if (L.snap) {
      L.camPos.copy(T.want);
      L.lookAt.copy(T.target);
      L.snap = false;
    } else {
      const kc = 1 - Math.exp(-16 * dt);
      L.camPos.lerp(T.want, kc);
      L.lookAt.lerp(T.target, kc);
    }
    camera.position.copy(L.camPos);
    camera.lookAt(L.lookAt);
  });

  return (
    <>
      <Ecctrl
        ref={ecctrl}
        position={[SPAWN_POINT[0], SPAWN_POINT[1] + FOOT_OFFSET, SPAWN_POINT[2]]}
        maxWalkVel={WALK_SPEED}
        maxRunVel={RUN_SPEED}
        enableToggleRun={false}
        capsuleHalfHeight={CAPSULE_HALF_HEIGHT}
        capsuleRadius={CAPSULE_RADIUS}
        floatHeight={FLOAT_HEIGHT}
      />
      <group ref={visual} position={SPAWN_POINT}>
        <Character jacket={jacket} moveMode={moveMode} />
      </group>
    </>
  );
}
