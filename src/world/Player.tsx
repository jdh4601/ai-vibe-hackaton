import { useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Ecctrl, type EcctrlHandle } from 'ecctrl';
import { EcctrlCameraControls, type EcctrlCameraControlsHandle } from 'ecctrl/camera';
import { useEffect, useRef } from 'react';
import { RUN_SPEED, SPAWN_POINT, WALK_SPEED } from '../game/config';
import { useGameStore } from '../stores/useGameStore';
import { usePlayerStore } from '../stores/usePlayerStore';

// Phase 0 spike: capsule character + follow camera. Track B owns and replaces this.
export function Player() {
  const ecctrl = useRef<EcctrlHandle>(null);
  const cam = useRef<EcctrlCameraControlsHandle>(null);
  const canMove = useGameStore((s) => s.phase === 'explore');
  const [, getKeys] = useKeyboardControls();
  const bodyColor = usePlayerStore((s) => s.jacket.bodyColor);

  useEffect(() => {
    const [x, y, z] = SPAWN_POINT;
    cam.current?.setLookAt(x, y + 2.6, z + 4.5, x, y + 1, z, false);
  }, []);

  useFrame(() => {
    const c = ecctrl.current;
    if (!c || !cam.current) return;
    const k = getKeys();
    c.setMovement(
      canMove
        ? { forward: k.forward, backward: k.backward, leftward: k.leftward, rightward: k.rightward, run: k.run }
        : { forward: false, backward: false, leftward: false, rightward: false, run: false },
    );
    cam.current.moveTo(c.currPos.x, c.currPos.y + 1, c.currPos.z, true);
    usePlayerStore.getState().setPose([c.currPos.x, c.currPos.y, c.currPos.z], 0);
  });

  return (
    <>
      <EcctrlCameraControls ref={cam} makeDefault smoothTime={0.1} minDistance={4.5} maxDistance={4.5} />
      <Ecctrl ref={ecctrl} position={SPAWN_POINT} enable={canMove} maxWalkVel={WALK_SPEED} maxRunVel={RUN_SPEED}>
        <mesh castShadow position={[0, 0, 0]}>
          <capsuleGeometry args={[0.3, 0.7]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
      </Ecctrl>
    </>
  );
}
